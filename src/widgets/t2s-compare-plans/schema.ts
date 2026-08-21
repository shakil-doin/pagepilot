import { z } from "zod";
import { field, widgetMeta } from "@/widgets/lib";
import { introShape, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-compare-plans",
  name: "Plan Feature Matrix",
  category: "Pricing",
  description: "Grouped feature table comparing two plans, with a show-more toggle",
});

export const schema = z.object({
  ...introShape,
  featuresLabel: field(z.string().default("Features"), { control: "text", label: "Table corner label" }),
  columnA: field(z.string().default("Basic"), { control: "text", label: "Column A" }),
  columnB: field(z.string().default("Pro"), { control: "text", label: "Column B" }),
  groups: field(
    z
      .array(
        z.object({
          category: field(z.string().default("Category"), { control: "text", label: "Category" }),
          rows: field(
            z
              .array(
                z.object({
                  name: field(z.string().default("Feature"), { control: "text", label: "Feature" }),
                  aValue: field(z.enum(["yes", "no", "text"]).default("yes"), {
                    control: "segmented",
                    label: "Column A value",
                    options: [
                      { label: "Yes", value: "yes" },
                      { label: "No", value: "no" },
                      { label: "Text", value: "text" },
                    ],
                  }),
                  aText: field(z.string().optional(), { control: "text", label: "Column A text" }),
                  bValue: field(z.enum(["yes", "no", "text"]).default("yes"), {
                    control: "segmented",
                    label: "Column B value",
                    options: [
                      { label: "Yes", value: "yes" },
                      { label: "No", value: "no" },
                      { label: "Text", value: "text" },
                    ],
                  }),
                  bText: field(z.string().optional(), { control: "text", label: "Column B text" }),
                }),
              )
              .default([]),
            { control: "list", label: "Rows", itemLabel: "name" },
          ),
        }),
      )
      .default([]),
    { control: "list", label: "Groups", itemLabel: "category" },
  ),
  visibleGroups: field(z.number().int().min(0).max(20).default(2), {
    control: "number",
    label: "Groups shown before expanding",
    description: "0 shows everything with no toggle",
  }),
  footnote: field(z.string().optional(), { control: "text", label: "Footnote" }),
  expandLabel: field(z.string().default("See full comparison"), { control: "text", label: "Expand label" }),
  collapseLabel: field(z.string().default("Hide full comparison"), { control: "text", label: "Collapse label" }),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
export type Group = Props["groups"][number];
