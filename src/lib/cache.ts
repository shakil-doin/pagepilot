import { revalidateTag, unstable_cache } from "next/cache";

export const TAGS = {
  page: (path: string) => `page:${path}`,
  pages: "pages", // list of published paths (sitemap, static params)
  theme: "theme",
  menu: "menu",
  globalWidget: (id: string) => `global-widget:${id}`,
  post: (slug: string) => `post:${slug}`,
  blogIndex: "blog-index",
  settings: "settings",
  redirects: "redirects",
  icons: "icons",
} as const;

// Immediate expiry so a publish is visible on the very next request.
// Next 16 deprecated the single-argument form; { expire: 0 } restores it.
export const expireTag = (...tags: string[]) => {
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
};

// Thin wrapper so all cached reads share one signature and stay greppable.
export const cached = <TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  keyParts: string[],
  tags: string[],
) => unstable_cache(fn, keyParts, { tags });

// Public render-path reads must degrade gracefully. If the database is
// unreachable (Neon asleep, a network blip, or a timeout that outlives the
// retry budget in db.ts), a rejected read would otherwise crash the whole
// page render. Wrapping the read — OUTSIDE unstable_cache so a failure is
// never cached — lets the site fall back to sane defaults and recover on the
// next request once the database responds again. Use this ONLY for reads on
// the public site; mutations and Studio reads must keep surfacing errors so
// the operator knows a write did not happen.
// Condenses a Prisma/pg failure to a single readable reason instead of the
// multi-line "Invalid `db.x.y()` invocation …" dump, so a handled fallback
// reads as a tidy warning, not an alarming stack.
const dbErrorReason = (err: unknown): string => {
  const e = err as { code?: string; message?: string };
  if (e?.code) return e.code; // Prisma code: P1001 (unreachable), P2024 (pool timeout), …
  const msg = String(e?.message ?? err);
  const cause = msg.match(
    /Can't reach database server|Timed out|Connection terminated|server closed the connection|ECONNREFUSED|ETIMEDOUT|ECONNRESET/i,
  );
  return cause ? cause[0] : msg.split("\n")[0].slice(0, 120);
};

export const withFallback = async <T>(
  label: string,
  fn: () => Promise<T>,
  fallback: NoInfer<T>,
): Promise<T> => {
  try {
    return await fn();
  } catch (err) {
    // warn, not error: the read failed but was handled — the page still renders.
    console.warn(`[read:${label}] database unavailable, using fallback (${dbErrorReason(err)})`);
    return fallback;
  }
};
