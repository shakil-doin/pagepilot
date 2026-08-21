import { z } from "zod";
import { field, widgetMeta } from "@/widgets/lib";
import { alignField, introShape, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-section-title",
  name: "Section Intro",
  category: "Content",
  description: "Standalone badge + heading + description block to open any section",
});

export const schema = z.object({
  ...introShape,
  align: alignField,
  rule: field(z.boolean().default(false), { control: "switch", label: "Accent rule" }),
  asPageHeading: field(z.boolean().default(false), {
    control: "switch",
    label: "Render as H1",
    description: "Use once per page, for the main page heading",
  }),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
