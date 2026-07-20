import { z } from "zod";
import { field, widgetMeta } from "@/widgets/lib";

export const meta = widgetMeta({
  key: "heading",
  name: "Heading",
  category: "Basic",
  description: "A single heading line with level and alignment",
  primitive: true,
});

export const schema = z.object({
  text: field(z.string().min(1).default("Heading"), { control: "text", label: "Text" }),
  level: field(z.enum(["h1", "h2", "h3", "h4"]).default("h2"), {
    control: "segmented",
    label: "Level",
  }),
  align: field(z.enum(["left", "center", "right"]).default("left"), {
    control: "segmented",
    label: "Align",
    responsive: true,
  }),
});

export type Props = z.infer<typeof schema>;
