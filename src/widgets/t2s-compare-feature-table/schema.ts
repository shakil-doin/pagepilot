import { z } from "zod";
import { field, widgetMeta } from "@/widgets/lib";
import { introShape, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-compare-feature-table",
  name: "Competitor Table",
  category: "Compare",
  description: "Feature rows across competitor columns, with one column promoted as the pick",
});

export const schema = z.object({
  ...introShape,
  featureLabel: field(z.string().default("Features"), { control: "text", label: "Feature column label" }),
  columns: field(
    z
      .array(
        z.object({
          name: field(z.string().default("Product"), { control: "text", label: "Name" }),
          tagline: field(z.string().optional(), { control: "text", label: "Tagline" }),
          badge: field(z.string().optional(), { control: "text", label: "Badge" }),
          highlight: field(z.boolean().default(false), { control: "switch", label: "Highlight column" }),
        }),
      )
      .default([]),
    { control: "list", label: "Columns", itemLabel: "name" },
  ),
  rows: field(
    z
      .array(
        z.object({
          feature: field(z.string().default("Feature"), { control: "text", label: "Feature" }),
          cells: field(
            z
              .array(
                z.object({
                  kind: field(z.enum(["check", "cross", "rating", "text"]).default("check"), {
                    control: "select",
                    label: "Kind",
                    options: [
                      { label: "Check", value: "check" },
                      { label: "Cross", value: "cross" },
                      { label: "Rating", value: "rating" },
                      { label: "Text", value: "text" },
                    ],
                  }),
                  text: field(z.string().optional(), { control: "text", label: "Text" }),
                }),
              )
              .default([]),
            { control: "list", label: "Cells", itemLabel: "text" },
          ),
        }),
      )
      .default([]),
    { control: "list", label: "Rows", itemLabel: "feature" },
  ),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
export type TableCell = Props["rows"][number]["cells"][number];
