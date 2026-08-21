import { z } from "zod";
import { field, widgetMeta } from "@/widgets/lib";
import { introShape, makeToneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-compare-highlights",
  name: "Highlight Numbers",
  category: "Proof",
  description: "Dark panel of big-number cards with an accented unit and sub-label",
});

export const schema = z.object({
  ...introShape,
  title: field(z.string().optional(), { control: "text", label: "Title" }),
  cards: field(
    z
      .array(
        z.object({
          value: field(z.string().default("99"), { control: "text", label: "Value" }),
          unit: field(z.string().optional(), { control: "text", label: "Unit" }),
          label: field(z.string().default("Label"), { control: "text", label: "Label" }),
          sublabel: field(z.string().optional(), { control: "text", label: "Sub-label" }),
        }),
      )
      .default([]),
    { control: "list", label: "Cards", itemLabel: "label" },
  ),
  tone: makeToneField("dark"),
  rounded: field(z.boolean().default(true), { control: "switch", label: "Rounded panel" }),
});

export type Props = z.infer<typeof schema>;
