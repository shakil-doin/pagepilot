import { z } from "zod";
import { field, widgetMeta } from "@/widgets/lib";
import { cardItem, introShape, makeToneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-compare-how-tested",
  name: "Glass Card Grid",
  category: "Compare",
  description: "Dark panel of translucent icon cards — how a comparison was tested, or any benefit grid",
});

export const schema = z.object({
  ...introShape,
  subtitle: field(z.string().optional(), { control: "text", label: "Subtitle" }),
  columns: field(z.number().int().min(2).max(4).default(3), {
    control: "segmented",
    label: "Columns",
    options: [
      { label: "2", value: 2 },
      { label: "3", value: 3 },
      { label: "4", value: 4 },
    ],
  }),
  cards: field(z.array(cardItem).default([]), { control: "list", label: "Cards", itemLabel: "title" }),
  note: field(z.string().optional(), { control: "textarea", label: "Footnote" }),
  tone: makeToneField("dark"),
  rounded: field(z.boolean().default(true), { control: "switch", label: "Rounded panel" }),
});

export type Props = z.infer<typeof schema>;
