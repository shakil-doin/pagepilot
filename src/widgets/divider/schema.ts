import { z } from "zod";
import { field, widgetMeta } from "@/widgets/lib";

export const meta = widgetMeta({
  key: "divider",
  name: "Divider",
  category: "Layout",
  description: "A horizontal rule",
  primitive: true,
});

export const schema = z.object({
  width: field(z.enum(["full", "narrow"]).default("full"), { control: "segmented", label: "Width" }),
});

export type Props = z.infer<typeof schema>;
