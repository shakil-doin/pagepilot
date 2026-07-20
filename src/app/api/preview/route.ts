import { NextRequest, NextResponse } from "next/server";
import { draftMode } from "next/headers";
import { requireSession } from "@/modules/auth/rbac";

// Turns on Next.js draft mode for the builder canvas iframe and previews,
// then redirects to the page path. Studio session required.
export const GET = async (req: NextRequest) => {
  try {
    await requireSession();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  const path = req.nextUrl.searchParams.get("path") ?? "/";
  (await draftMode()).enable();
  return NextResponse.redirect(new URL(path, req.url));
};

export const DELETE = async () => {
  (await draftMode()).disable();
  return NextResponse.json({ data: { disabled: true } });
};
