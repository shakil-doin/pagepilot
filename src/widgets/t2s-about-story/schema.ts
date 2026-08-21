import { z } from "zod";
import { field, widgetMeta, mediaRef } from "@/widgets/lib";
import { alignField, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-about-story",
  name: "Story Block",
  category: "Content",
  description: "Long-form story section: heading, paragraphs and an optional image",
});

export const schema = z.object({
  title: field(z.string().default("Our story"), { control: "text", label: "Title" }),
  body: field(z.string().default(""), { control: "richtext", label: "Body" }),
  image: field(mediaRef.optional(), { control: "media", label: "Image", accept: "image" }),
  imagePosition: field(z.enum(["left", "right", "above"]).default("right"), {
    control: "segmented",
    label: "Image position",
  }),
  align: alignField,
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
