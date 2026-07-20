import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { acceptInvite } from "@/modules/users/user.service";
import { rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  email: z.string().email(),
  token: z.string().min(10),
  password: z.string().min(8).max(200),
});

export const POST = async (req: NextRequest) => {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  const limited = rateLimit(`invite:${ip}`, { limit: 10, windowMs: 15 * 60 * 1000 });
  if (!limited.ok) {
    return NextResponse.json({ error: { code: "RATE_LIMITED", message: "Too many attempts" } }, { status: 429 });
  }
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "VALIDATION", message: "Invalid input" } }, { status: 400 });
  }
  try {
    await acceptInvite(parsed.data.email, parsed.data.token, parsed.data.password);
    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    return NextResponse.json(
      { error: { code: "INVALID_INVITE", message: err instanceof Error ? err.message : "Invalid invite" } },
      { status: 400 },
    );
  }
};
