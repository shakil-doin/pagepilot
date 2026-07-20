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
  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = (await res.json().catch(() => null)) as { data?: T; error?: { code: string; message: string } } | null;
  if (!res.ok || !json || json.error) {
    // A 401 means the session cookie is missing/stale (e.g. a rotated
    // AUTH_SECRET). Navigations can still serve cached RSC and look logged in,
    // so a write is often the first thing that reveals it — bounce to /login to
    // mint a fresh cookie instead of failing silently with a toast.
    if (res.status === 401 && typeof window !== "undefined") {
      const callbackUrl = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/login?callbackUrl=${callbackUrl}`;
    }
    throw new ApiClientError(res.status, json?.error?.code ?? "UNKNOWN", json?.error?.message ?? res.statusText);
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
