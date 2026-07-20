import { z } from "zod";
import { field, widgetMeta, sectionBackground } from "@/widgets/lib";

export const meta = widgetMeta({
  key: "stats-row",
  name: "Stats Row",
  category: "Marketing",
  description: "Row of headline numbers with labels and optional icons",
});

export const schema = z.object({
  items: field(
    z
      .array(
        z.object({
          value: field(z.string().min(1).default("99.9%"), { control: "text", label: "Value" }),
          label: field(z.string().min(1).default("Uptime"), { control: "text", label: "Label" }),
          icon: field(z.string().optional(), { control: "icon", label: "Icon" }),
        }),
      )
      .default([]),
    { control: "list", label: "Stats", itemLabel: "label" },
  ),
  columns: field(z.number().int().min(2).max(4).default(4), {
    control: "segmented",
    label: "Columns (desktop)",
    options: [
      { label: "2", value: 2 },
      { label: "3", value: 3 },
      { label: "4", value: 4 },
    ],
    responsive: true,
  }),
  background: sectionBackground,
});

export type Props = z.infer<typeof schema>;
