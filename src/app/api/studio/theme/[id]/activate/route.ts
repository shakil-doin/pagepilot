import { NextRequest } from "next/server";
import { handleApi, requireCapability } from "@/modules/auth/rbac";
import { activateTheme } from "@/modules/theme/theme.service";

type Params = { params: Promise<{ id: string }> };

export const POST = (_req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const { id } = await params;
    const user = await requireCapability("theme.manage");
    await activateTheme(user.id, id);
    return { ok: true };
  });
