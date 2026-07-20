import "server-only";
import crypto from "node:crypto";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { audit } from "@/modules/auth/audit.service";
import { sendMail } from "@/lib/mailer";
import { APP } from "@/config/app.config";
import type { Role, UserStatus, PageAccess } from "@/generated/prisma/enums";

export const listUsers = () =>
  db.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      image: true,
      createdAt: true,
      _count: { select: { permissions: true, posts: true } },
    },
  });

export const getUser = (id: string) =>
  db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      image: true,
      createdAt: true,
      permissions: { include: { page: { select: { id: true, path: true, title: true } } } },
    },
  });

// Invite flow: create the user without a password and email a set-password link
// backed by a VerificationToken row.
export const inviteUser = async (
  actorId: string,
  data: { name: string; email: string; role: Role },
) => {
  const existing = await db.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error("A user with this email already exists");

  const user = await db.user.create({ data: { name: data.name, email: data.email, role: data.role } });
  const token = crypto.randomBytes(32).toString("hex");
  await db.verificationToken.create({
    data: { identifier: data.email, token, expires: new Date(Date.now() + 7 * 24 * 3600 * 1000) },
  });

  const link = `${APP.url}/login/set-password?token=${token}&email=${encodeURIComponent(data.email)}`;
  const sent = await sendMail(
    data.email,
    "You have been invited to PagePilot Studio",
    `<p>Hello ${data.name},</p><p>You have been invited to PagePilot Studio. Set your password to get started:</p><p><a href="${link}">${link}</a></p><p>This link expires in 7 days.</p>`,
  );

  await audit(actorId, "user.invite", `User:${user.id}`, { email: data.email, role: data.role, mailSent: sent });
  // The link is returned so the admin can share it manually when SMTP is off
  return { user, inviteLink: link, mailSent: sent };
};

export const acceptInvite = async (email: string, token: string, password: string) => {
  const record = await db.verificationToken.findUnique({
    where: { identifier_token: { identifier: email, token } },
  });
  if (!record || record.expires < new Date()) throw new Error("Invalid or expired invite link");

  const passwordHash = await hash(password, 12);
  await db.$transaction([
    db.user.update({ where: { email }, data: { passwordHash, emailVerified: new Date() } }),
    db.verificationToken.delete({ where: { identifier_token: { identifier: email, token } } }),
  ]);
};

export const updateUser = async (
  actorId: string,
  id: string,
  data: Partial<{ name: string; role: Role; status: UserStatus; password: string }>,
) => {
  const passwordHash = data.password ? await hash(data.password, 12) : undefined;
  const user = await db.user.update({
    where: { id },
    data: { name: data.name, role: data.role, status: data.status, passwordHash },
  });
  // Role change or deactivation revokes existing sessions immediately
  if (data.role || data.status === "DISABLED") {
    await db.session.deleteMany({ where: { userId: id } });
  }
  await audit(actorId, data.role ? "user.role.change" : "user.update", `User:${id}`, {
    role: data.role,
    status: data.status,
  });
  return user;
};

export const setPagePermissions = async (
  actorId: string,
  userId: string,
  grants: { pageId: string; access: PageAccess }[],
) => {
  await db.$transaction([
    db.pagePermission.deleteMany({ where: { userId } }),
    db.pagePermission.createMany({ data: grants.map((grant) => ({ userId, ...grant })) }),
  ]);
  await audit(actorId, "user.permissions.set", `User:${userId}`, { grants: grants.length });
};

export const listAudit = async (params: { page?: number; userId?: string; entity?: string }) => {
  const page = params.page ?? 1;
  const where = {
    ...(params.userId ? { userId: params.userId } : {}),
    ...(params.entity ? { entity: { contains: params.entity } } : {}),
  };
  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * 50,
      take: 50,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    db.auditLog.count({ where }),
  ]);
  return { logs, total, pages: Math.max(1, Math.ceil(total / 50)) };
};
