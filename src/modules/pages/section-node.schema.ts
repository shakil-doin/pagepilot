import { z } from "zod";
import type { SectionNode } from "@/types";

// Shared validation for a builder section tree — the request body shape for the
// draft-save endpoint (kept separate so other section endpoints can reuse it).
export const sectionNodeSchema: z.ZodType<SectionNode> = z.lazy(() =>
  z.object({
    id: z.string().min(1),
    type: z.string().min(1),
    props: z.record(z.string(), z.unknown()).default({}),
    globalId: z.string().optional(),
    adminLabel: z.string().optional(),
    hidden: z.boolean().optional(),
    customCss: z.string().max(4000).optional(),
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

export const sectionsBodySchema = z.object({ sections: z.array(sectionNodeSchema) });
