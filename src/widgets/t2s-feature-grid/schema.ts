import { z } from "zod";
import { field, widgetMeta } from "@/widgets/lib";
import { alignField, introShape, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-feature-grid",
  name: "Numbered Feature Grid",
  category: "Marketing",
  description: "Tinted cards numbered 01, 02, 03 under a centered intro",
});

export const schema = z.object({
  ...introShape,
  align: alignField,
  columns: field(z.number().int().min(2).max(4).default(3), {
    control: "segmented",
    label: "Columns",
    options: [
      { label: "2", value: 2 },
      { label: "3", value: 3 },
      { label: "4", value: 4 },
    ],
  }),
  items: field(
    z
      .array(
        z.object({
          title: field(z.string().default("Feature"), { control: "text", label: "Title" }),
          description: field(z.string().optional(), { control: "textarea", label: "Description" }),
        }),
      )
      .default([]),
    { control: "list", label: "Items", itemLabel: "title" },
  ),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
