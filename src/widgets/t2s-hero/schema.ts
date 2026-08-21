import { z } from "zod";
import { field, widgetMeta, mediaRef, buttonItem } from "@/widgets/lib";
import { checkItem, introShape, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-hero",
  name: "Landing Hero",
  category: "Hero",
  description: "Centered hero: badge, star rating, headline, CTAs, feature checks and a product shot",
});

export const schema = z.object({
  ...introShape,
  title: field(z.string().default("Copy every trade, automatically"), {
    control: "textarea",
    label: "Headline",
  }),
  ratingLabel: field(z.string().optional(), { control: "text", label: "Rating label", placeholder: "Rated excellent" }),
  rating: field(z.number().min(0).max(5).default(4.5), {
    control: "slider",
    label: "Rating",
    min: 0,
    max: 5,
    step: 0.5,
  }),
  ratingSuffix: field(z.string().optional(), { control: "text", label: "Rating suffix", placeholder: "Trustpilot" }),
  buttons: field(z.array(buttonItem).default([]), { control: "list", label: "Buttons", itemLabel: "label" }),
  features: field(z.array(checkItem).default([]), { control: "list", label: "Feature checks", itemLabel: "text" }),
  image: field(mediaRef.optional(), { control: "media", label: "Product shot", accept: "image" }),
  backgroundImage: field(mediaRef.optional(), { control: "media", label: "Background image", accept: "image" }),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
