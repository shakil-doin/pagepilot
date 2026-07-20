import { z } from "zod";
import { field, widgetMeta, mediaRef } from "@/widgets/lib";

export const meta = widgetMeta({
  key: "video",
  name: "Video",
  category: "Basic",
  description: "Uploaded video or a YouTube/Vimeo embed",
  primitive: true,
});

export const schema = z.object({
  source: field(z.enum(["upload", "embed"]).default("embed"), {
    control: "segmented",
    label: "Source",
  }),
  media: field(mediaRef.optional(), { control: "media", label: "Video file", accept: "video" }),
  poster: field(mediaRef.optional(), { control: "media", label: "Poster image", accept: "image" }),
  embedUrl: field(z.string().optional(), {
    control: "text",
    label: "YouTube or Vimeo URL",
    placeholder: "https://www.youtube.com/watch?v=…",
  }),
  width: field(z.enum(["full", "wide", "narrow"]).default("wide"), {
    control: "segmented",
    label: "Width",
  }),
});

export type Props = z.infer<typeof schema>;
