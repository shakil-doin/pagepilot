import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { APP } from "@/config/app.config";

// Serverless Postgres (Neon) drops idle connections. A pooled connection that
// the server already closed throws on the next query — the first DB call after
// an idle spell fails with P1001/P1017/"Connection terminated". keepAlive and a
// short idle timeout reduce it; the retry extension below makes it invisible.
const pool = new Pool({
  connectionString: APP.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  keepAlive: true,
});
// A pool 'error' on an idle client would otherwise crash the process.
pool.on("error", (err) => console.error("[pg pool]", err.message));

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Errors that mean "the connection was stale/asleep", not "the query is wrong".
// Prisma P1xxx are all connection/engine-level; P2024 is a pool timeout. Query
// errors (P2002 unique, P2025 not-found, …) are P2xxx and must NOT be retried.
const isTransient = (err: unknown): boolean => {
  const e = err as { code?: string; name?: string; message?: string };
  if (e?.name === "PrismaClientInitializationError") return true;
  if (e?.code && (e.code.startsWith("P1") || e.code === "P2024")) return true;
  const message = String(e?.message ?? "");
  return /connection.*(closed|terminated|reset|refused)|ECONNRESET|ECONNREFUSED|ETIMEDOUT|Timed out fetching a connection|Can't reach database|terminating connection|server closed the connection/i.test(
    message,
  );
};

const createClient = () =>
  new PrismaClient({ adapter: new PrismaPg(pool) }).$extends({
    name: "retry-transient",
    query: {
      async $allOperations({ args, query }) {
        let lastError: unknown;
        // Serverless Postgres (Neon) can take a few seconds to wake from idle,
        // so back off up to ~4.5s total before giving up.
        for (let attempt = 0; attempt < 5; attempt++) {
          try {
            return await query(args);
          } catch (err) {
            if (!isTransient(err)) throw err;
            lastError = err;
            await sleep(Math.min(250 * 2 ** attempt, 2000)); // 250, 500, 1000, 2000ms
          }
        }
        throw lastError;
      },
    },
  });

// One client per process; dev hot-reload reuses the global instance.
const globalForPrisma = globalThis as unknown as { prisma?: ReturnType<typeof createClient> };

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
