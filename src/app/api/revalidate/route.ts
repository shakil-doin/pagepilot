import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { expireTag } from "@/lib/cache";
import { APP } from "@/config/app.config";

const bodySchema = z.object({ tags: z.array(z.string().min(1)).min(1) });

// Internal tag revalidation, guarded by REVALIDATE_KEY (external triggers,
// deploy hooks). Studio mutations revalidate directly in their services.
export const POST = async (req: NextRequest) => {
  const key = req.headers.get("x-revalidate-key") ?? req.nextUrl.searchParams.get("key");
  if (!APP.revalidateKey || key !== APP.revalidateKey) {
    return NextResponse.json({ error: { code: "FORBIDDEN", message: "Bad key" } }, { status: 403 });
  }
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "VALIDATION", message: "tags[] required" } }, { status: 400 });
  }
  expireTag(...parsed.data.tags);
  return NextResponse.json({ data: { revalidated: parsed.data.tags } });
};
