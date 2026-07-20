import { z } from "zod";
import { field, widgetMeta, sectionBackground } from "@/widgets/lib";

export const meta = widgetMeta({
  key: "comparison",
  name: "Comparison",
  category: "Marketing",
  description: "Feature-by-feature comparison table between two columns",
});

export const schema = z.object({
  title: field(z.string().optional(), { control: "text", label: "Title" }),
  columnA: field(z.string().min(1).default("Us"), { control: "text", label: "Column A" }),
  columnB: field(z.string().min(1).default("Others"), { control: "text", label: "Column B" }),
  rows: field(
    z
      .array(
        z.object({
          feature: field(z.string().min(1).default("Feature"), { control: "text", label: "Feature" }),
          a: field(z.boolean().default(true), { control: "switch", label: "Column A has it" }),
          b: field(z.boolean().default(false), { control: "switch", label: "Column B has it" }),
        }),
      )
      .default([]),
    { control: "list", label: "Rows", itemLabel: "feature" },
  ),
  background: sectionBackground,
});

export type Props = z.infer<typeof schema>;
