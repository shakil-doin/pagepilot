import { z } from "zod";
import { field, widgetMeta, sectionBackground } from "@/widgets/lib";

export const meta = widgetMeta({
  key: "steps",
  name: "Steps",
  category: "Marketing",
  description: "Numbered or icon steps explaining a process",
});

export const schema = z.object({
  title: field(z.string().optional(), { control: "text", label: "Title" }),
  items: field(
    z
      .array(
        z.object({
          title: field(z.string().min(1).default("Step title"), { control: "text", label: "Title" }),
          text: field(z.string().optional(), { control: "textarea", label: "Text" }),
          icon: field(z.string().optional(), { control: "icon", label: "Icon" }),
        }),
      )
      .default([]),
    { control: "list", label: "Steps", itemLabel: "title" },
  ),
  layout: field(z.enum(["horizontal", "vertical"]).default("horizontal"), {
    control: "segmented",
    label: "Layout",
  }),
  numbered: field(z.boolean().default(true), { control: "switch", label: "Numbered" }),
  background: sectionBackground,
});

export type Props = z.infer<typeof schema>;
