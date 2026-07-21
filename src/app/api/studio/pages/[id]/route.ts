import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApi, requireCapability, requirePageAccess, ApiAuthError } from "@/modules/auth/rbac";
import {
  getPageForStudio,
  updatePageMeta,
  deletePage,
  archivePage,
  unpublishPage,
  setPageIndexing,
} from "@/modules/pages/page.service";

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
  // Status/indexing controls (page-management concerns).
  published: z.boolean().optional(), // false → take a live page back to draft
  noindex: z.boolean().optional(), // true → remove from search indexing
});

export const PATCH = (req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const { id } = await params;
    const body = metaSchema.parse(await req.json());
    // Path/lock/status/indexing changes are page-management concerns, not content edits
    const isManagement =
      body.path !== undefined ||
      body.locked !== undefined ||
      body.archived !== undefined ||
      body.published !== undefined ||
      body.noindex !== undefined;
    const user = isManagement ? await requireCapability("pages.manage") : await requirePageAccess(id, "EDIT");
    if (body.archived) return archivePage(user.id, id);
    if (body.published === false) return unpublishPage(user.id, id);
    if (body.noindex !== undefined) return setPageIndexing(user.id, id, body.noindex);
    return updatePageMeta(user.id, id, body);
  });

export const DELETE = (_req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const { id } = await params;
    const user = await requireCapability("pages.manage");
    await deletePage(user.id, id);
    return { deleted: true };
  });
