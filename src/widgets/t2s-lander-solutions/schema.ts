import { z } from "zod";
import { field, widgetMeta } from "@/widgets/lib";
import { cardItem, introShape, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-lander-solutions",
  name: "Solution Section",
  category: "Marketing",
  description: "Green solution cards under a centered intro, followed by a row of stat tiles",
});

export const schema = z.object({
  ...introShape,
  info: field(z.string().optional(), { control: "text", label: "Emphasis line" }),
  columns: field(z.number().int().min(2).max(4).default(3), {
    control: "segmented",
    label: "Card columns",
    options: [
      { label: "2", value: 2 },
      { label: "3", value: 3 },
      { label: "4", value: 4 },
    ],
  }),
  solutions: field(z.array(cardItem).default([]), { control: "list", label: "Solution cards", itemLabel: "title" }),
  stats: field(
    z
      .array(
        z.object({
          value: field(z.string().default("100%"), { control: "text", label: "Value" }),
          label: field(z.string().default("Label"), { control: "text", label: "Label" }),
          sublabel: field(z.string().optional(), { control: "text", label: "Sub-label" }),
        }),
      )
      .default([]),
    { control: "list", label: "Stat tiles", itemLabel: "label" },
  ),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
