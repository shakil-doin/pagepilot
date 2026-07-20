import nodemailer from "nodemailer";
import { APP } from "@/config/app.config";
import { getSetting } from "@/modules/settings/settings.service";

type SmtpSettings = { host?: string; port?: number; user?: string; pass?: string; from?: string };

// Env values win over UI settings so ops can pin them.
const resolveSmtp = async (): Promise<SmtpSettings | null> => {
  const ui = await getSetting<SmtpSettings>("email", {});
  const host = APP.smtp.host || ui.host;
  if (!host) return null;
  return {
    host,
    port: APP.smtp.host ? APP.smtp.port : (ui.port ?? 587),
    user: APP.smtp.user || ui.user,
    pass: APP.smtp.pass || ui.pass,
    from: APP.smtp.from || ui.from || "noreply@localhost",
  };
};

export const sendMail = async (to: string, subject: string, html: string): Promise<boolean> => {
  const smtp = await resolveSmtp();
  if (!smtp) {
    console.warn("[mailer] SMTP not configured; mail to", to, "dropped:", subject);
    return false;
  }
  const transport = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: smtp.user ? { user: smtp.user, pass: smtp.pass } : undefined,
  });
  await transport.sendMail({ from: smtp.from, to, subject, html });
  return true;
};
