// Thin typed fetch wrapper for all Studio client calls.
export class ApiClientError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

const request = async <T>(method: string, url: string, body?: unknown): Promise<T> => {
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // fetch rejects only on a network-level failure (offline, DNS, CORS).
    throw new ApiClientError(0, "NETWORK", "Can’t reach the server. Check your connection and try again.");
  }

  // Read the body as text first: a platform error (Vercel 500/504 on a Neon
  // cold-start timeout) returns HTML/plain text, not our JSON envelope, and on
  // HTTP/2 `res.statusText` is always empty — both would otherwise surface as a
  // blank, unreadable toast.
  const raw = await res.text().catch(() => "");
  let json: { data?: T; error?: { code: string; message: string } } | null = null;
  try {
    json = raw ? JSON.parse(raw) : null;
  } catch {
    json = null;
  }

  if (!res.ok || !json || json.error) {
    // A 401 means the session cookie is missing/stale (e.g. a rotated
    // AUTH_SECRET). Navigations can still serve cached RSC and look logged in,
    // so a write is often the first thing that reveals it — bounce to /login to
    // mint a fresh cookie instead of failing silently with a toast.
    if (res.status === 401 && typeof window !== "undefined") {
      const callbackUrl = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/login?callbackUrl=${callbackUrl}`;
    }
    const message =
      json?.error?.message ||
      // Non-JSON body: show a trimmed hint (e.g. a gateway timeout page) rather
      // than nothing.
      (!json && raw ? raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160) : "") ||
      res.statusText ||
      (res.status === 504 ? "The server took too long to respond (database may be waking up). Try again." : "") ||
      `Request failed (${res.status || "no response"})`;
    throw new ApiClientError(res.status, json?.error?.code ?? "UNKNOWN", message);
  }
  return json.data as T;
};

export const api = {
  get: <T>(url: string) => request<T>("GET", url),
  post: <T>(url: string, body?: unknown) => request<T>("POST", url, body),
  patch: <T>(url: string, body?: unknown) => request<T>("PATCH", url, body),
  put: <T>(url: string, body?: unknown) => request<T>("PUT", url, body),
  del: <T>(url: string) => request<T>("DELETE", url),
};
