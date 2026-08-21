import { z } from "zod";
import { field, widgetMeta } from "@/widgets/lib";
import { cardItem, introShape, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-lander-problems",
  name: "Problem Section",
  category: "Marketing",
  description: "Pain-point intro with everyday scenarios, a rating row and red problem cards",
});

export const schema = z.object({
  ...introShape,
  info: field(z.string().optional(), { control: "text", label: "Emphasis line" }),
  scenarios: field(
    z
      .array(
        z.object({
          icon: field(z.string().optional(), { control: "icon", label: "Icon" }),
          title: field(z.string().default("Scenario"), { control: "text", label: "Title" }),
          subtitle: field(z.string().optional(), { control: "text", label: "Subtitle" }),
        }),
      )
      .default([]),
    { control: "list", label: "Scenarios", itemLabel: "title" },
  ),
  ratingScore: field(z.string().optional(), { control: "text", label: "Rating score" }),
  ratingSource: field(z.string().optional(), { control: "text", label: "Rating source" }),
  ratingReviews: field(z.string().optional(), { control: "text", label: "Rating reviews" }),
  cards: field(z.array(cardItem).default([]), { control: "list", label: "Problem cards", itemLabel: "title" }),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
