import { z } from "zod";
import { field, widgetMeta, mediaRef } from "@/widgets/lib";
import { alignField, checkItem, introShape, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-product-tour",
  name: "Product Tour",
  category: "Process",
  description: "Intro, inline feature checks and a large product screenshot or embedded video",
});

export const schema = z.object({
  ...introShape,
  align: alignField,
  features: field(z.array(checkItem).default([]), { control: "list", label: "Feature checks", itemLabel: "text" }),
  image: field(mediaRef.optional(), { control: "media", label: "Screenshot", accept: "image" }),
  embedUrl: field(z.string().optional(), {
    control: "text",
    label: "Embed URL",
    description: "Optional video embed shown instead of the screenshot",
    placeholder: "https://player.vimeo.com/video/123456",
  }),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
