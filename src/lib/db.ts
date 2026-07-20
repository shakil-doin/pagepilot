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

// Codes/messages that mean "the connection was stale", not "the query is wrong".
const isTransient = (err: unknown): boolean => {
  const code = (err as { code?: string })?.code;
  if (code && ["P1001", "P1002", "P1017", "P2024"].includes(code)) return true;
  const message = String((err as { message?: string })?.message ?? "");
  return /connection.*(closed|terminated|reset)|ECONNRESET|ECONNREFUSED|Timed out fetching a connection/i.test(message);
};

const createClient = () =>
  new PrismaClient({ adapter: new PrismaPg(pool) }).$extends({
    name: "retry-transient",
    query: {
      async $allOperations({ args, query }) {
        let lastError: unknown;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            return await query(args);
          } catch (err) {
            if (!isTransient(err)) throw err;
            lastError = err;
            await sleep(150 * (attempt + 1)); // let the pool hand out a fresh connection
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
