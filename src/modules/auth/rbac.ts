import "server-only";
import { NextResponse } from "next/server";
import { auth } from "@/modules/auth";
import { can, isAdmin, accessSatisfies, type Capability } from "@/modules/auth/permissions";
import { db } from "@/lib/db";
import type { Role, PageAccess } from "@/generated/prisma/enums";

export type SessionUser = { id: string; role: Role; name?: string | null; email?: string | null };

export class ApiAuthError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

// Every /api/studio handler starts here: session must exist and user be active.
export const requireSession = async (): Promise<SessionUser> => {
  const session = await auth();
  const user = session?.user;
  if (!user?.id || user.status === "DISABLED") {
    throw new ApiAuthError(401, "UNAUTHORIZED", "Sign in required");
  }
  return { id: user.id, role: user.role, name: user.name, email: user.email };
};

export const requireCapability = async (capability: Capability): Promise<SessionUser> => {
  const user = await requireSession();
  if (!can(user.role, capability)) {
    throw new ApiAuthError(403, "FORBIDDEN", `Missing capability: ${capability}`);
  }
  return user;
};

// ADMIN+ bypasses grants; a locked page requires ADMIN+ outright.
export const requirePageAccess = async (
  pageId: string,
  required: PageAccess,
): Promise<SessionUser> => {
  const user = await requireSession();
  if (isAdmin(user.role)) return user;

  const page = await db.page.findUnique({ where: { id: pageId }, select: { locked: true } });
  if (!page) throw new ApiAuthError(404, "NOT_FOUND", "Page not found");
  if (page.locked) throw new ApiAuthError(403, "FORBIDDEN", "Page is locked to admins");

  // EDITOR can never publish even when granted PUBLISH on a page
  if (required === "PUBLISH" && !can(user.role, "pages.publish.granted")) {
    throw new ApiAuthError(403, "FORBIDDEN", "Your role cannot publish");
  }

  const grant = await db.pagePermission.findUnique({
    where: { userId_pageId: { userId: user.id, pageId } },
  });
  if (!grant || !accessSatisfies(grant.access, required)) {
    throw new ApiAuthError(403, "FORBIDDEN", "No access to this page");
  }
  return user;
};

export const jsonData = <T>(data: T, init?: ResponseInit) => NextResponse.json({ data }, init);

export const jsonError = (status: number, code: string, message: string) =>
  NextResponse.json({ error: { code, message } }, { status });

// Wraps a route handler body: auth errors and Zod errors become typed JSON.
export const handleApi = async <T>(fn: () => Promise<T>): Promise<NextResponse> => {
  try {
    const data = await fn();
    return jsonData(data);
  } catch (err) {
    if (err instanceof ApiAuthError) return jsonError(err.status, err.code, err.message);
    if (err && typeof err === "object" && "issues" in err) {
      return jsonError(400, "VALIDATION", JSON.stringify((err as { issues: unknown }).issues));
    }
    // Prisma "record not found" (update/delete on a row a concurrent action
    // already removed) is a 404, not a server error.
    if (err && typeof err === "object" && (err as { code?: string }).code === "P2025") {
      return jsonError(404, "NOT_FOUND", "That item no longer exists");
    }
    console.error("[api]", err);
    return jsonError(500, "INTERNAL", "Something went wrong");
  }
};
