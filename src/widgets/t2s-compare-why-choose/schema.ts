import { z } from "zod";
import { field, widgetMeta, mediaRef, buttonItem } from "@/widgets/lib";
import { cardItem, checkItem, introShape, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-compare-why-choose",
  name: "Why Choose Mosaic",
  category: "Compare",
  description: "Icon cards arranged around a product showcase tile, closing with checks and a CTA",
});

export const schema = z.object({
  ...introShape,
  cards: field(z.array(cardItem).default([]), { control: "list", label: "Cards", itemLabel: "title" }),
  image: field(mediaRef.optional(), {
    control: "media",
    label: "Showcase image",
    accept: "image",
    description: "With an image the cards form a mosaic around it; without one they sit in an even grid",
  }),
  features: field(z.array(checkItem).default([]), { control: "list", label: "Closing checks", itemLabel: "text" }),
  buttons: field(z.array(buttonItem).default([]), { control: "list", label: "Buttons", itemLabel: "label" }),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
