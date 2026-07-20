import { NextRequest, NextResponse } from "next/server";

type RedirectMap = Record<string, { to: string; permanent: boolean }>;

// The redirect map is fetched from an internal route (the proxy cannot reach
// Prisma) and cached in-module for a few seconds.
let cache: { map: RedirectMap; fetchedAt: number } | null = null;
const TTL_MS = 15_000;

const getMap = async (origin: string): Promise<RedirectMap> => {
  if (cache && Date.now() - cache.fetchedAt < TTL_MS) return cache.map;
  try {
    const res = await fetch(`${origin}/api/redirects-map`);
    if (res.ok) {
      cache = { map: (await res.json()) as RedirectMap, fetchedAt: Date.now() };
      return cache.map;
    }
  } catch {
    // fall through to the stale map
  }
  return cache?.map ?? {};
};

export const proxy = async (req: NextRequest) => {
  const { pathname } = req.nextUrl;

  // Trailing-slash normalization (Next handles most cases; belt and braces)
  if (pathname.length > 1 && pathname.endsWith("/")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(0, -1);
    return NextResponse.redirect(url, 308);
  }

  const map = await getMap(req.nextUrl.origin);
  const hit = map[pathname];
  if (hit) {
    const target = hit.to.startsWith("http") ? hit.to : new URL(hit.to, req.url);
    return NextResponse.redirect(target, hit.permanent ? 308 : 307);
  }

  return NextResponse.next();
};

export const config = {
  // Static assets, Next internals, API and Studio routes skip redirect checks
  matcher: ["/((?!_next|api|studio|login|uploads|favicon.ico|sitemap.xml|robots.txt).*)"],
};
