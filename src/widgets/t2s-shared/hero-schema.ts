import { z } from "zod";
import { field, mediaRef, buttonItem } from "@/widgets/lib";
import { checkItem, introShape, makeToneField, type Tone } from "@/widgets/t2s-lib";

// Shared shape for the centered marketing heroes (compare, learn, learn hub).
// Only the banner width and starting tone differ between them.
export const heroSchema = (defaults: { title: string; banner: "contained" | "full"; tone?: Tone }) =>
  z.object({
    ...introShape,
    title: field(z.string().default(defaults.title), { control: "textarea", label: "Headline" }),
    buttons: field(z.array(buttonItem).default([]), { control: "list", label: "Buttons", itemLabel: "label" }),
    ratingLabel: field(z.string().optional(), { control: "text", label: "Rating label" }),
    rating: field(z.number().min(0).max(5).default(4.5), {
      control: "slider",
      label: "Rating",
      min: 0,
      max: 5,
      step: 0.5,
    }),
    ratingSuffix: field(z.string().optional(), { control: "text", label: "Rating suffix" }),
    stats: field(
      z
        .array(
          z.object({
            value: field(z.string().default("10k+"), { control: "text", label: "Value" }),
            label: field(z.string().default("Label"), { control: "text", label: "Label" }),
          }),
        )
        .default([]),
      { control: "list", label: "Stats", itemLabel: "label" },
    ),
    features: field(z.array(checkItem).default([]), { control: "list", label: "Feature checks", itemLabel: "text" }),
    image: field(mediaRef.optional(), { control: "media", label: "Banner", accept: "image" }),
    banner: field(z.enum(["contained", "full"]).default(defaults.banner), {
      control: "segmented",
      label: "Banner width",
    }),
    backgroundImage: field(mediaRef.optional(), { control: "media", label: "Background image", accept: "image" }),
    tone: makeToneField(defaults.tone ?? "light"),
  });
