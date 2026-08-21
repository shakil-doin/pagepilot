import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { APP } from "@/config/app.config";

// `pg` (via pg-connection-string) prints a deprecation warning when the URL
// carries sslmode=require/prefer/verify-ca, because a future major will change
// what those mean. We strip sslmode from the string and configure TLS on the
// pool directly, which pins the current secure behavior (full certificate
// verification — Neon presents a publicly-trusted cert) and silences the
// warning. sslmode=disable is honored for local, non-TLS Postgres.
const parseDbConfig = (raw: string): { connectionString: string; ssl: false | { rejectUnauthorized: boolean } } => {
  try {
    const url = new URL(raw);
    const sslmode = url.searchParams.get("sslmode");
    url.searchParams.delete("sslmode");
    return { connectionString: url.toString(), ssl: sslmode === "disable" ? false : { rejectUnauthorized: true } };
  } catch {
    // Not a parseable URL (rare): leave it untouched and default to verified TLS.
    return { connectionString: raw, ssl: { rejectUnauthorized: true } };
  }
};

const { connectionString, ssl } = parseDbConfig(APP.databaseUrl);

// Serverless Postgres (Neon) drops idle connections. A pooled connection that
// the server already closed throws on the next query — the first DB call after
// an idle spell fails with P1001/P1017/"Connection terminated". keepAlive and a
// short idle timeout reduce it; the retry extension below makes it invisible.
const pool = new Pool({
  connectionString,
  ssl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  keepAlive: true,
});
// A pool 'error' on an idle client would otherwise crash the process.
pool.on("error", (err) => console.error("[pg pool]", err.message));

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Node/pg surface connection failures as an errno code (ETIMEDOUT, ECONNRESET…)
// on err.code — and Prisma's driver-adapter path can re-throw them as a
// PrismaClientKnownRequestError whose CODE is that errno and whose MESSAGE is
// empty. Checking only the message (as before) missed these entirely, so a
// cold-start/connection timeout was treated as a query error and never retried.
const TRANSIENT_CODES = new Set([
  "P2024", // Prisma: timed out fetching a connection from the pool
  "ETIMEDOUT",
  "ECONNRESET",
  "ECONNREFUSED",
  "EPIPE",
  "ENOTFOUND",
  "EAI_AGAIN",
  "ENETUNREACH",
  "EHOSTUNREACH",
]);

// Errors that mean "the connection was stale/asleep", not "the query is wrong".
// Prisma P1xxx are all connection/engine-level; query errors (P2002 unique,
// P2025 not-found, P2022 bad column, …) are P2xxx and must NOT be retried.
const isTransient = (err: unknown): boolean => {
  const e = err as { code?: string; name?: string; message?: string };
  if (e?.name === "PrismaClientInitializationError") return true;
  if (e?.code && (e.code.startsWith("P1") || TRANSIENT_CODES.has(e.code))) return true;
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
        // Neon's free tier suspends the database after ~5 min idle; the first
        // queries after that fail fast (ECONNREFUSED/ETIMEDOUT) while it wakes,
        // which usually takes a few seconds. 7 attempts spanning ~11s of backoff
        // comfortably outlast the wake-up so cold-start reads succeed on retry
        // instead of falling back — no transient errors reach the page.
        const MAX_ATTEMPTS = 7;
        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
          try {
            return await query(args);
          } catch (err) {
            if (!isTransient(err)) throw err;
            lastError = err;
            if (attempt < MAX_ATTEMPTS - 1) {
              await sleep(Math.min(250 * 2 ** attempt, 2500)); // 250,500,1000,2000,2500,2500
            }
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
