import { z } from "zod";
import { field, widgetMeta, sectionBackground } from "@/widgets/lib";

export const meta = widgetMeta({
  key: "rich-text",
  name: "Rich Text",
  category: "Basic",
  description: "Formatted text with headings, lists and links",
  primitive: true,
});

export const schema = z.object({
  html: field(z.string().default("<p>Write something.</p>"), { control: "richtext", label: "Content" }),
  maxWidth: field(z.enum(["full", "prose"]).default("prose"), {
    control: "segmented",
    label: "Width",
  }),
  background: sectionBackground,
});

export type Props = z.infer<typeof schema>;
