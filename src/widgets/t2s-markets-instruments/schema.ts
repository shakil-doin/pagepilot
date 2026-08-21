import { z } from "zod";
import { field, widgetMeta } from "@/widgets/lib";
import { introShape, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-markets-instruments",
  name: "Instrument Cards",
  category: "Marketing",
  description: "Cards opening with a badge chip and closing with a single highlighted check line",
});

export const schema = z.object({
  ...introShape,
  columns: field(z.number().int().min(2).max(4).default(3), {
    control: "segmented",
    label: "Columns",
    options: [
      { label: "2", value: 2 },
      { label: "3", value: 3 },
      { label: "4", value: 4 },
    ],
  }),
  cards: field(
    z
      .array(
        z.object({
          badge: field(z.string().optional(), { control: "text", label: "Badge" }),
          title: field(z.string().default("Instrument"), { control: "text", label: "Title" }),
          subtitle: field(z.string().optional(), { control: "text", label: "Subtitle" }),
          description: field(z.string().optional(), { control: "textarea", label: "Description" }),
          check: field(z.string().optional(), { control: "text", label: "Check line" }),
        }),
      )
      .default([]),
    { control: "list", label: "Cards", itemLabel: "title" },
  ),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
