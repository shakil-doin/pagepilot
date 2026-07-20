import { NextRequest } from "next/server";
import { handleApi, requireCapability } from "@/modules/auth/rbac";
import { deleteRedirect } from "@/modules/seo/seo.service";

type Params = { params: Promise<{ id: string }> };

export const DELETE = (_req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const { id } = await params;
    const user = await requireCapability("seo.manage");
    await deleteRedirect(user.id, id);
    return { deleted: true };
  });
