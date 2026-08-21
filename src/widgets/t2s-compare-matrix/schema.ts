import { z } from "zod";
import { field, widgetMeta, linkRef } from "@/widgets/lib";
import { introShape, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-compare-matrix",
  name: "Product Matrix",
  category: "Compare",
  description: "Wide scrollable matrix of products against feature columns, each row linking out",
});

export const schema = z.object({
  ...introShape,
  productLabel: field(z.string().default("Product"), { control: "text", label: "First column label" }),
  actionLabel: field(z.string().default("Action"), { control: "text", label: "Action column label" }),
  columns: field(
    z
      .array(z.object({ label: field(z.string().default("Column"), { control: "text", label: "Label" }) }))
      .default([]),
    { control: "list", label: "Feature columns", itemLabel: "label" },
  ),
  rows: field(
    z
      .array(
        z.object({
          product: field(z.string().default("Product"), { control: "text", label: "Product" }),
          highlight: field(z.boolean().default(false), { control: "switch", label: "Highlight row" }),
          actionLabel: field(z.string().default("Compare"), { control: "text", label: "Action label" }),
          link: field(linkRef.default({ href: "#" }), { control: "link", label: "Action link" }),
          cells: field(
            z
              .array(
                z.object({
                  kind: field(z.enum(["check", "cross", "text"]).default("check"), {
                    control: "segmented",
                    label: "Kind",
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
    { control: "list", label: "Rows", itemLabel: "product" },
  ),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
export type Cell = Props["rows"][number]["cells"][number];
