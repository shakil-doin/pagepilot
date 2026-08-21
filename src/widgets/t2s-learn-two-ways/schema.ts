import { z } from "zod";
import { field, widgetMeta } from "@/widgets/lib";
import { toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-learn-two-ways",
  name: "Two Ways Cards",
  category: "Education",
  description: "Side-by-side framed cards, one of which can be promoted as the featured option",
});

export const schema = z.object({
  title: field(z.string().default("Two ways to do this"), { control: "textarea", label: "Title" }),
  cards: field(
    z
      .array(
        z.object({
          badge: field(z.string().optional(), { control: "text", label: "Badge" }),
          title: field(z.string().default("Option"), { control: "text", label: "Title" }),
          text: field(z.string().optional(), { control: "textarea", label: "Text" }),
          featured: field(z.boolean().default(false), { control: "switch", label: "Featured" }),
        }),
      )
      .default([]),
    { control: "list", label: "Cards", itemLabel: "title" },
  ),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
