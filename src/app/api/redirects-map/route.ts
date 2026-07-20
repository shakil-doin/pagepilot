import { NextResponse } from "next/server";
import { getRedirectMapCached } from "@/modules/seo/seo.service";

// Consumed by proxy.ts, which cannot query the database directly.
export const GET = async () => {
  const map = await getRedirectMapCached();
  return NextResponse.json(map, {
    headers: { "Cache-Control": "public, max-age=15, stale-while-revalidate=60" },
  });
};
