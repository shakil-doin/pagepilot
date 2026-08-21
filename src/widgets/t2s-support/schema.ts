import { z } from "zod";
import { field, widgetMeta } from "@/widgets/lib";
import { introShape, reviewItem, statItem, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-support",
  name: "Support Highlight",
  category: "Proof",
  description: "Boxed panel: badge, headline, stat tiles and a rotating customer review",
});

export const schema = z.object({
  ...introShape,
  stats: field(z.array(statItem).default([]), { control: "list", label: "Stats", itemLabel: "label" }),
  reviews: field(z.array(reviewItem).default([]), { control: "list", label: "Reviews", itemLabel: "name" }),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
