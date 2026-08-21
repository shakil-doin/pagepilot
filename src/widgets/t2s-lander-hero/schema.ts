import { z } from "zod";
import { field, widgetMeta, mediaRef } from "@/widgets/lib";
import { cardItem, makeToneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-lander-hero",
  name: "Landing Page Hero",
  category: "Hero",
  description: "Rating row, stacked headline, avatar social proof, icon features and a product banner",
});

export const schema = z.object({
  ratingScore: field(z.string().optional(), { control: "text", label: "Rating score", placeholder: "4.8" }),
  ratingSource: field(z.string().optional(), { control: "text", label: "Rating source" }),
  ratingStars: field(z.number().int().min(0).max(5).default(5), {
    control: "slider",
    label: "Filled stars",
    min: 0,
    max: 5,
    step: 1,
  }),
  titleLines: field(
    z
      .array(z.object({ text: field(z.string().default("Headline line"), { control: "text", label: "Line" }) }))
      .default([]),
    { control: "list", label: "Headline lines", itemLabel: "text" },
  ),
  intro: field(z.string().optional(), { control: "textarea", label: "Intro" }),
  avatars: field(
    z
      .array(z.object({ image: field(mediaRef.optional(), { control: "media", label: "Avatar", accept: "image" }) }))
      .default([]),
    { control: "list", label: "Social proof avatars" },
  ),
  socialProofText: field(z.string().optional(), { control: "text", label: "Social proof text" }),
  features: field(z.array(cardItem).default([]), { control: "list", label: "Icon features", itemLabel: "title" }),
  bannerDesktop: field(mediaRef.optional(), { control: "media", label: "Banner (desktop)", accept: "image" }),
  bannerMobile: field(mediaRef.optional(), { control: "media", label: "Banner (mobile)", accept: "image" }),
  backgroundImage: field(mediaRef.optional(), { control: "media", label: "Background image", accept: "image" }),
  tone: makeToneField("light"),
});

export type Props = z.infer<typeof schema>;
