import { z } from "zod";
import { field, widgetMeta } from "@/widgets/lib";

export const meta = widgetMeta({
  key: "spacer",
  name: "Spacer",
  category: "Layout",
  description: "Vertical space between sections",
  primitive: true,
});

export const schema = z.object({
  size: field(z.enum(["sm", "md", "lg"]).default("md"), {
    control: "segmented",
    label: "Size",
    responsive: true,
  }),
});

export type Props = z.infer<typeof schema>;
