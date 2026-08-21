import { z } from "zod";
import { field, widgetMeta, mediaRef } from "@/widgets/lib";
import { alignField, introShape, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-video-review",
  name: "Video Testimonials",
  category: "Proof",
  description: "Swipeable row of video testimonial cards with thumbnail, quote and author",
});

export const schema = z.object({
  ...introShape,
  align: alignField,
  videos: field(
    z
      .array(
        z.object({
          name: field(z.string().default("Customer name"), { control: "text", label: "Name" }),
          role: field(z.string().optional(), { control: "text", label: "Role" }),
          quote: field(z.string().optional(), { control: "textarea", label: "Quote" }),
          thumbnail: field(mediaRef.optional(), { control: "media", label: "Thumbnail", accept: "image" }),
          embedUrl: field(z.string().default(""), {
            control: "text",
            label: "Embed URL",
            placeholder: "https://player.vimeo.com/video/123456",
          }),
        }),
      )
      .default([]),
    { control: "list", label: "Videos", itemLabel: "name" },
  ),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
