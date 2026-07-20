import { z } from "zod";
import { field, widgetMeta, mediaRef, buttonItem } from "@/widgets/lib";

export const meta = widgetMeta({
  key: "hero",
  name: "Hero",
  category: "Marketing",
  description: "Big opening section: eyebrow, headline, subtext, buttons, image",
});

export const schema = z.object({
  eyebrow: field(z.string().optional(), { control: "text", label: "Eyebrow" }),
  headline: field(z.string().min(1).default("Your headline here"), {
    control: "textarea",
    label: "Headline",
  }),
  subtext: field(z.string().optional(), { control: "textarea", label: "Subtext" }),
  buttons: field(z.array(buttonItem).default([]), {
    control: "list",
    label: "Buttons",
    itemLabel: "label",
  }),
  image: field(mediaRef.optional(), { control: "media", label: "Image", accept: "image" }),
  layout: field(z.enum(["center", "split"]).default("split"), {
    control: "segmented",
    label: "Layout",
  }),
  background: field(z.enum(["none", "surface", "gradient", "secondary"]).default("none"), {
    control: "select",
    label: "Background",
    options: [
      { label: "None", value: "none" },
      { label: "Surface", value: "surface" },
      { label: "Brand gradient", value: "gradient" },
      { label: "Secondary", value: "secondary" },
    ],
  }),
});

export type Props = z.infer<typeof schema>;
