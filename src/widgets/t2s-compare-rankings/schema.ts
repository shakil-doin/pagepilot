import { z } from "zod";
import { field, widgetMeta, buttonItem } from "@/widgets/lib";
import { checkItem, introShape, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-compare-rankings",
  name: "Ranked Reviews Tabs",
  category: "Compare",
  description: "Tabbed review cards with advantages, limitations and a verdict per product",
});

export const schema = z.object({
  ...introShape,
  advantagesLabel: field(z.string().default("Advantages"), { control: "text", label: "Advantages heading" }),
  limitationsLabel: field(z.string().default("Limitations"), { control: "text", label: "Limitations heading" }),
  verdictLabel: field(z.string().default("Verdict"), { control: "text", label: "Verdict heading" }),
  items: field(
    z
      .array(
        z.object({
          tab: field(z.string().default("Tab"), { control: "text", label: "Tab label" }),
          name: field(z.string().default("Product"), { control: "text", label: "Name" }),
          tagline: field(z.string().optional(), { control: "text", label: "Tagline" }),
          score: field(z.string().optional(), { control: "text", label: "Score" }),
          badge: field(z.string().optional(), { control: "text", label: "Badge" }),
          description: field(z.string().optional(), { control: "textarea", label: "Description" }),
          buttons: field(z.array(buttonItem).default([]), { control: "list", label: "Buttons", itemLabel: "label" }),
          advantages: field(z.array(checkItem).default([]), { control: "list", label: "Advantages", itemLabel: "text" }),
          limitations: field(z.array(checkItem).default([]), { control: "list", label: "Limitations", itemLabel: "text" }),
          verdict: field(z.string().optional(), { control: "textarea", label: "Verdict" }),
        }),
      )
      .default([]),
    { control: "list", label: "Products", itemLabel: "tab" },
  ),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
export type RankingItem = Props["items"][number];
