import { z } from "zod";
import { field, widgetMeta } from "@/widgets/lib";
import { checkItem, introShape, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-learn-difference",
  name: "Difference Cards",
  category: "Education",
  description: "Two tinted definition cards split by a VS divider, closing with a callout bar",
});

export const schema = z.object({
  ...introShape,
  divider: field(z.string().default("VS"), { control: "text", label: "Divider label" }),
  cards: field(
    z
      .array(
        z.object({
          title: field(z.string().default("Approach"), { control: "text", label: "Title" }),
          badge: field(z.string().optional(), { control: "text", label: "Badge" }),
          text: field(z.string().optional(), { control: "textarea", label: "Text" }),
          accent: field(z.enum(["primary", "secondary"]).default("primary"), {
            control: "segmented",
            label: "Accent",
          }),
          items: field(z.array(checkItem).default([]), { control: "list", label: "Points", itemLabel: "text" }),
        }),
      )
      .default([]),
    { control: "list", label: "Cards", itemLabel: "title" },
  ),
  callout: field(z.string().optional(), { control: "textarea", label: "Callout" }),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
