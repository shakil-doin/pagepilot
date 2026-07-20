import { NextRequest } from "next/server";
import { handleApi, requireCapability } from "@/modules/auth/rbac";
import { uninstallIconSet } from "@/modules/icons/icon.service";

type Params = { params: Promise<{ prefix: string }> };

export const DELETE = (_req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const { prefix } = await params;
    const user = await requireCapability("icons.install");
    await uninstallIconSet(user.id, prefix);
    return { deleted: true };
  });
