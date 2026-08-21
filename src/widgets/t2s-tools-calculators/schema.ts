import { z } from "zod";
import { field, widgetMeta, buttonItem } from "@/widgets/lib";
import { introShape, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-tools-calculators",
  name: "Tool Hub Cards",
  category: "Education",
  description: "Directory cards linking to each calculator or tool, with an icon tile and CTA",
});

export const schema = z.object({
  ...introShape,
  columns: field(z.number().int().min(1).max(3).default(2), {
    control: "segmented",
    label: "Columns",
    options: [
      { label: "1", value: 1 },
      { label: "2", value: 2 },
      { label: "3", value: 3 },
    ],
  }),
  cards: field(
    z
      .array(
        z.object({
          icon: field(z.string().optional(), { control: "icon", label: "Icon" }),
          title: field(z.string().default("Tool"), { control: "text", label: "Title" }),
          description: field(z.string().optional(), { control: "textarea", label: "Description" }),
          buttons: field(z.array(buttonItem).default([]), { control: "list", label: "Buttons", itemLabel: "label" }),
        }),
      )
      .default([]),
    { control: "list", label: "Tools", itemLabel: "title" },
  ),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
