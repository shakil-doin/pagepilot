import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApi, requirePageAccess } from "@/modules/auth/rbac";
import { saveDraft } from "@/modules/pages/page.service";
import { validateSections } from "@/modules/pages/validate.service";
import type { SectionNode } from "@/types";

type Params = { params: Promise<{ id: string }> };

const sectionNodeSchema: z.ZodType<SectionNode> = z.lazy(() =>
  z.object({
    id: z.string().min(1),
    type: z.string().min(1),
    props: z.record(z.string(), z.unknown()).default({}),
    globalId: z.string().optional(),
    adminLabel: z.string().optional(),
    hidden: z.boolean().optional(),
    spacing: z
      .object({
        top: z.enum(["none", "sm", "md", "lg"]).optional(),
        bottom: z.enum(["none", "sm", "md", "lg"]).optional(),
      })
      .optional(),
    responsive: z
      .object({
        hideOn: z.array(z.enum(["mobile", "tablet", "desktop"])).optional(),
        overrides: z
          .object({
            mobile: z.record(z.string(), z.unknown()).optional(),
            tablet: z.record(z.string(), z.unknown()).optional(),
            desktop: z.record(z.string(), z.unknown()).optional(),
          })
          .optional(),
      })
      .optional(),
    children: z.array(z.array(sectionNodeSchema)).optional(),
  }),
);

const bodySchema = z.object({ sections: z.array(sectionNodeSchema) });

// Autosave target for the builder: structural validation always, widget-level
// blockers returned as data so the UI can badge them without losing work.
export const PATCH = (req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const { id } = await params;
    const user = await requirePageAccess(id, "EDIT");
    const { sections } = bodySchema.parse(await req.json());
    const blockers = validateSections(sections, "save");
    const revision = await saveDraft(user.id, id, sections);
    return { revisionId: revision.id, version: revision.version, savedAt: revision.createdAt, blockers };
  });
