// In-memory sliding window limiter. Good enough for a single-node deploy;
// swap for Redis behind the same signature when scaling out.
type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();

export const rateLimit = (
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): { ok: boolean; retryAfterSec: number } => {
  const now = Date.now();
  const current = windows.get(key);

  if (!current || current.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }

  current.count += 1;
  if (current.count > limit) {
    return { ok: false, retryAfterSec: Math.ceil((current.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfterSec: 0 };
};
