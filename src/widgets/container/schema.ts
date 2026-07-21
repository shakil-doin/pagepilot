import { z } from "zod";
import { field, widgetMeta, sectionBackground } from "@/widgets/lib";

export const meta = widgetMeta({
  key: "container",
  name: "Container",
  category: "Layout",
  description: "A single box that groups widgets with padding, width and background",
  primitive: true,
});

export const schema = z.object({
  width: field(z.enum(["full", "wide", "narrow"]).default("wide"), {
    control: "segmented",
    label: "Width",
  }),
  gap: field(z.enum(["none", "sm", "md", "lg"]).default("md"), {
    control: "segmented",
    label: "Gap between items",
  }),
  align: field(z.enum(["left", "center", "right"]).default("left"), {
    control: "segmented",
    label: "Align",
  }),
  background: sectionBackground,
});

export type Props = z.infer<typeof schema>;
