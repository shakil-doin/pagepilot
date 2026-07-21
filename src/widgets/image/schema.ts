import { z } from "zod";
import { field, widgetMeta, mediaRef } from "@/widgets/lib";

export const meta = widgetMeta({
  key: "image",
  name: "Image",
  category: "Basic",
  description: "A single image with optional caption",
  primitive: true,
});

export const schema = z.object({
  // Optional so a freshly-added image widget doesn't error while you're still
  // picking a file (publish is blocked separately until an image is chosen).
  media: field(mediaRef.optional(), { control: "media", label: "Image", accept: "image" }),
  caption: field(z.string().optional(), { control: "text", label: "Caption" }),
  width: field(z.enum(["full", "wide", "narrow"]).default("wide"), {
    control: "segmented",
    label: "Width",
  }),
  rounded: field(z.boolean().default(true), { control: "switch", label: "Rounded corners" }),
});

export type Props = z.infer<typeof schema>;
