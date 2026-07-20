import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApi, requirePageAccess, ApiAuthError } from "@/modules/auth/rbac";
import { publishPage } from "@/modules/pages/page.service";
import { validateSections } from "@/modules/pages/validate.service";
import { db } from "@/lib/db";
import type { SectionNode } from "@/types";

type Params = { params: Promise<{ id: string }> };

const bodySchema = z.object({ note: z.string().max(500).optional() });

export const POST = (req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const { id } = await params;
    const user = await requirePageAccess(id, "PUBLISH");
    const { note } = bodySchema.parse(await req.json().catch(() => ({})));

    const draft = await db.pageRevision.findFirst({ where: { pageId: id }, orderBy: { version: "desc" } });
    if (!draft) throw new ApiAuthError(400, "EMPTY", "Nothing to publish");

    const blockers = validateSections((draft.sections as SectionNode[]) ?? [], "publish");
    if (blockers.length > 0) {
      throw new ApiAuthError(422, "BLOCKED", JSON.stringify(blockers));
    }

    const revision = await publishPage(user.id, id, note);
    return { publishedRevisionId: revision.id, version: revision.version };
  });
