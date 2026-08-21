import { z } from "zod";
import { field, widgetMeta } from "@/widgets/lib";
import { alignField, introShape, statItem, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-about",
  name: "Intro + Stats",
  category: "Marketing",
  description: "Section intro on one side, a grid of big-number stat cards on the other",
});

export const schema = z.object({
  ...introShape,
  align: alignField,
  columns: field(z.number().int().min(1).max(3).default(2), {
    control: "segmented",
    label: "Stat columns",
    options: [
      { label: "1", value: 1 },
      { label: "2", value: 2 },
      { label: "3", value: 3 },
    ],
  }),
  stats: field(z.array(statItem).default([]), { control: "list", label: "Stats", itemLabel: "label" }),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
