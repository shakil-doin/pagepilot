import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApi, requirePageAccess } from "@/modules/auth/rbac";
import { rollbackPage } from "@/modules/pages/page.service";

type Params = { params: Promise<{ id: string }> };

const bodySchema = z.object({ revisionId: z.string().min(1) });

export const POST = (req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const { id } = await params;
    const user = await requirePageAccess(id, "PUBLISH");
    const { revisionId } = bodySchema.parse(await req.json());
    const revision = await rollbackPage(user.id, id, revisionId);
    return { publishedRevisionId: revision.id, version: revision.version };
  });
