import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApi, requireSession, requireCapability } from "@/modules/auth/rbac";
import { listPages, createPage } from "@/modules/pages/page.service";
import type { PageStatus } from "@/generated/prisma/enums";

export const GET = (req: NextRequest) =>
  handleApi(async () => {
    const user = await requireSession();
    const params = req.nextUrl.searchParams;
    return listPages({
      query: params.get("query") ?? undefined,
      status: (params.get("status") as PageStatus) || undefined,
      page: Number(params.get("page")) || 1,
      user,
    });
  });

const createSchema = z.object({ path: z.string().min(1), title: z.string().min(1) });

export const POST = (req: NextRequest) =>
  handleApi(async () => {
    const user = await requireCapability("pages.manage");
    const body = createSchema.parse(await req.json());
    return createPage(user.id, body);
  });
