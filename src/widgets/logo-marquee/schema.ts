import { z } from "zod";
import { field, widgetMeta, mediaRef } from "@/widgets/lib";

export const meta = widgetMeta({
  key: "logo-marquee",
  name: "Logo Marquee",
  category: "Marketing",
  description: "Infinitely scrolling row of partner or customer logos",
});

export const schema = z.object({
  title: field(z.string().optional(), { control: "text", label: "Title" }),
  logos: field(
    z
      .array(
        z.object({
          image: field(mediaRef, { control: "media", label: "Logo", accept: "image" }),
        }),
      )
      .default([]),
    { control: "list", label: "Logos", itemLabel: "image" },
  ),
  speed: field(z.enum(["slow", "normal", "fast"]).default("normal"), {
    control: "segmented",
    label: "Speed",
  }),
  grayscale: field(z.boolean().default(true), { control: "switch", label: "Grayscale" }),
});

export type Props = z.infer<typeof schema>;
