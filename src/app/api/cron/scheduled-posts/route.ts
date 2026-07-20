import { NextRequest, NextResponse } from "next/server";
import { publishDueScheduledPosts } from "@/modules/blog/blog.service";
import { APP } from "@/config/app.config";

// Hit this every minute from cron (see docs/DEPLOY.md) to flip due
// SCHEDULED posts to PUBLISHED.
export const GET = async (req: NextRequest) => {
  const key = req.headers.get("x-revalidate-key") ?? req.nextUrl.searchParams.get("key");
  if (!APP.revalidateKey || key !== APP.revalidateKey) {
    return NextResponse.json({ error: { code: "FORBIDDEN", message: "Bad key" } }, { status: 403 });
  }
  const published = await publishDueScheduledPosts();
  return NextResponse.json({ data: { published } });
};
