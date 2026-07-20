import { NextRequest } from "next/server";
import { handleApi, requirePageAccess } from "@/modules/auth/rbac";
import { listRevisions } from "@/modules/pages/page.service";

type Params = { params: Promise<{ id: string }> };

export const GET = (_req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const { id } = await params;
    await requirePageAccess(id, "VIEW");
    return listRevisions(id);
  });
