import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApi, requireCapability, ApiAuthError } from "@/modules/auth/rbac";
import { getUser, updateUser, setPagePermissions } from "@/modules/users/user.service";

type Params = { params: Promise<{ id: string }> };

export const GET = (_req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const { id } = await params;
    await requireCapability("users.manage");
    const user = await getUser(id);
    if (!user) throw new ApiAuthError(404, "NOT_FOUND", "User not found");
    return user;
  });

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(["SUPERADMIN", "ADMIN", "MODERATOR", "EDITOR"]).optional(),
  status: z.enum(["ACTIVE", "DISABLED"]).optional(),
  password: z.string().min(8).optional(),
});

export const PATCH = (req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const { id } = await params;
    const actor = await requireCapability("users.manage");
    const body = patchSchema.parse(await req.json());
    return updateUser(actor.id, id, body);
  });

const grantsSchema = z.object({
  grants: z.array(z.object({ pageId: z.string().min(1), access: z.enum(["VIEW", "EDIT", "PUBLISH"]) })),
});

export const PUT = (req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const { id } = await params;
    const actor = await requireCapability("users.manage");
    const { grants } = grantsSchema.parse(await req.json());
    await setPagePermissions(actor.id, id, grants);
    return { ok: true };
  });
