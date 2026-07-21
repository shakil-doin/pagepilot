import { NextRequest } from "next/server";
import { handleApi, requirePageAccess } from "@/modules/auth/rbac";
import { saveDraft } from "@/modules/pages/page.service";
import { validateSections } from "@/modules/pages/validate.service";
import { sectionsBodySchema } from "@/modules/pages/section-node.schema";

type Params = { params: Promise<{ id: string }> };

// Draft save target for the builder: persists the section tree so the canvas
// (draft-mode render) reflects it. Structural validation always; widget-level
// blockers returned as data so the UI can badge them without losing work.
export const PATCH = (req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const { id } = await params;
    const user = await requirePageAccess(id, "EDIT");
    const { sections } = sectionsBodySchema.parse(await req.json());
    const blockers = validateSections(sections, "save");
    const revision = await saveDraft(user.id, id, sections);
    return { revisionId: revision.id, version: revision.version, savedAt: revision.createdAt, blockers };
  });
