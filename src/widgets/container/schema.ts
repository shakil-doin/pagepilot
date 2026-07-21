import { z } from "zod";
import { field, widgetMeta, sectionBackground } from "@/widgets/lib";

export const meta = widgetMeta({
  key: "container",
  name: "Container",
  category: "Layout",
  description: "A flexible box that groups widgets with flex layout, width and background",
  primitive: true,
});

export const schema = z.object({
  direction: field(z.enum(["column", "row"]).default("column"), {
    control: "segmented",
    label: "Direction",
  }),
  justify: field(z.enum(["start", "center", "end", "between"]).default("start"), {
    control: "segmented",
    label: "Justify (main axis)",
  }),
  items: field(z.enum(["start", "center", "end", "stretch"]).default("stretch"), {
    control: "segmented",
    label: "Align (cross axis)",
  }),
  wrap: field(z.boolean().default(false), { control: "switch", label: "Wrap items" }),
  gap: field(z.enum(["none", "sm", "md", "lg"]).default("md"), {
    control: "segmented",
    label: "Gap",
  }),
  width: field(z.enum(["full", "wide", "narrow"]).default("wide"), {
    control: "segmented",
    label: "Width",
  }),
  background: sectionBackground,
});

export type Props = z.infer<typeof schema>;
