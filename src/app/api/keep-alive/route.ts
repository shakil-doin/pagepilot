import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Keeps serverless Postgres (Neon) warm. Neon's free tier suspends after a few
// minutes idle, and the first request after that pays a multi-second cold start
// — which is what makes the builder's draft preview and the first page view
// feel slow. Ping this every ~4 minutes (an external uptime pinger, or Vercel
// Cron on a paid plan) so the database stays awake.
//
// It only issues a trivial `SELECT 1` — no secret, no data returned — so it is
// safe to call publicly.
export const dynamic = "force-dynamic";

export const GET = async () => {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
};
