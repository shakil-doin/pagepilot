import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApi, requireCapability, requirePageAccess, ApiAuthError } from "@/modules/auth/rbac";
import { getPageForStudio, updatePageMeta, deletePage, archivePage } from "@/modules/pages/page.service";

type Params = { params: Promise<{ id: string }> };

export const GET = (_req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const { id } = await params;
    await requirePageAccess(id, "VIEW");
    const page = await getPageForStudio(id);
    if (!page) throw new ApiAuthError(404, "NOT_FOUND", "Page not found");
    return page;
  });

const metaSchema = z.object({
  title: z.string().min(1).optional(),
  path: z.string().min(1).optional(),
  hideHeader: z.boolean().optional(),
  hideFooter: z.boolean().optional(),
  locked: z.boolean().optional(),
  archived: z.boolean().optional(),
});

export const PATCH = (req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const { id } = await params;
    const body = metaSchema.parse(await req.json());
    // Path/lock changes are page-management concerns, not content edits
    const user =
      body.path !== undefined || body.locked !== undefined || body.archived !== undefined
        ? await requireCapability("pages.manage")
        : await requirePageAccess(id, "EDIT");
    if (body.archived) return archivePage(user.id, id);
    return updatePageMeta(user.id, id, body);
  });

export const DELETE = (_req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const { id } = await params;
    const user = await requireCapability("pages.manage");
    await deletePage(user.id, id);
    return { deleted: true };
  });
