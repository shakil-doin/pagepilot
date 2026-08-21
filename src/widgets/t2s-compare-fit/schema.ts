import { z } from "zod";
import { field, widgetMeta } from "@/widgets/lib";
import { introShape, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-compare-fit",
  name: "Which Is For You",
  category: "Compare",
  description: "Boxed list matching each need on the left to the recommended pick on the right",
});

export const schema = z.object({
  ...introShape,
  rows: field(
    z
      .array(
        z.object({
          need: field(z.string().default("If you need…"), { control: "text", label: "Need" }),
          pick: field(z.string().default("Pick this"), { control: "text", label: "Pick" }),
          highlight: field(z.boolean().default(false), { control: "switch", label: "Highlight pick" }),
        }),
      )
      .default([]),
    { control: "list", label: "Rows", itemLabel: "need" },
  ),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
