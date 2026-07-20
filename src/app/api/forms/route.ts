import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { getSetting } from "@/modules/settings/settings.service";
import { sendMail } from "@/lib/mailer";
import { db } from "@/lib/db";

const contactSchema = z.object({
  type: z.literal("contact"),
  name: z.string().min(1).max(200),
  email: z.string().email(),
  message: z.string().min(1).max(5000),
  phone: z.string().max(50).optional(),
  company: z.string().max(200).optional(),
});

const newsletterSchema = z.object({
  type: z.literal("newsletter"),
  email: z.string().email(),
});

const bodySchema = z.discriminatedUnion("type", [contactSchema, newsletterSchema]);

type FormsSettings = { notifyEmail?: string; webhookUrl?: string };

// Public endpoint used by the contact-form and newsletter widgets.
export const POST = async (req: NextRequest) => {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  const limited = rateLimit(`forms:${ip}`, { limit: 10, windowMs: 60 * 1000 });
  if (!limited.ok) {
    return NextResponse.json({ error: { code: "RATE_LIMITED", message: "Too many submissions" } }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "VALIDATION", message: "Invalid submission" } }, { status: 400 });
  }
  const submission = parsed.data;
  const settings = await getSetting<FormsSettings>("forms", {});

  // Submissions always land in the audit log so nothing is lost even with
  // no email/webhook configured.
  await db.auditLog.create({
    data: { action: `form.${submission.type}`, entity: `Form:${submission.type}`, detail: submission },
  });

  if (settings.webhookUrl) {
    fetch(settings.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submission),
    }).catch((err) => console.error("[forms] webhook failed", err));
  }

  if (settings.notifyEmail) {
    const subject = submission.type === "contact" ? `Contact form: ${submission.name}` : "New newsletter signup";
    const html =
      submission.type === "contact"
        ? `<p><strong>${submission.name}</strong> (${submission.email}${submission.phone ? `, ${submission.phone}` : ""}${submission.company ? `, ${submission.company}` : ""})</p><p>${submission.message.replace(/\n/g, "<br>")}</p>`
        : `<p>New subscriber: ${submission.email}</p>`;
    sendMail(settings.notifyEmail, subject, html).catch((err) => console.error("[forms] mail failed", err));
  }

  return NextResponse.json({ data: { ok: true } });
};
