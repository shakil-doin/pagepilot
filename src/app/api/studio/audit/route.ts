import { NextRequest } from "next/server";
import { handleApi, requireCapability } from "@/modules/auth/rbac";
import { listAudit } from "@/modules/users/user.service";

export const GET = (req: NextRequest) =>
  handleApi(async () => {
    await requireCapability("audit.view");
    const params = req.nextUrl.searchParams;
    return listAudit({
      page: Number(params.get("page")) || 1,
      userId: params.get("userId") ?? undefined,
      entity: params.get("entity") ?? undefined,
    });
  });
