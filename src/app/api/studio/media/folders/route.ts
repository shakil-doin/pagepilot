import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApi, requireCapability, ApiAuthError } from "@/modules/auth/rbac";
import { listFolders, createFolder, renameFolder, deleteFolder } from "@/modules/media/media.service";

export const GET = () =>
  handleApi(async () => {
    await requireCapability("media.manage");
    return listFolders();
  });

const createSchema = z.object({ name: z.string().min(1), parentId: z.string().nullish() });

export const POST = (req: NextRequest) =>
  handleApi(async () => {
    await requireCapability("media.manage");
    const body = createSchema.parse(await req.json());
    return createFolder(body.name, body.parentId);
  });

const renameSchema = z.object({ id: z.string().min(1), name: z.string().min(1) });

export const PATCH = (req: NextRequest) =>
  handleApi(async () => {
    await requireCapability("media.manage");
    const body = renameSchema.parse(await req.json());
    return renameFolder(body.id, body.name);
  });

export const DELETE = (req: NextRequest) =>
  handleApi(async () => {
    await requireCapability("media.manage");
    const id = req.nextUrl.searchParams.get("id");
    if (!id) throw new ApiAuthError(400, "MISSING_ID", "Query param id is required");
    await deleteFolder(id);
    return { deleted: true };
  });
