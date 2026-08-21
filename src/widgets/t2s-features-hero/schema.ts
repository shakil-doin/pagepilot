import { z } from "zod";
import { field, widgetMeta, mediaRef, buttonItem } from "@/widgets/lib";
import { checkItem, introShape, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-features-hero",
  name: "Feature Page Hero",
  category: "Hero",
  description: "Headline and CTA over a divided stat row and an inline list of supported platforms",
});

export const schema = z.object({
  ...introShape,
  title: field(z.string().default("Every feature you need"), { control: "textarea", label: "Headline" }),
  buttons: field(z.array(buttonItem).default([]), { control: "list", label: "Buttons", itemLabel: "label" }),
  stats: field(
    z
      .array(
        z.object({
          value: field(z.string().default("40+"), { control: "text", label: "Value" }),
          label: field(z.string().default("Label"), { control: "text", label: "Label" }),
        }),
      )
      .default([]),
    { control: "list", label: "Stats", itemLabel: "label" },
  ),
  platformNote: field(z.string().optional(), { control: "text", label: "Platform note" }),
  platforms: field(z.array(checkItem).default([]), { control: "list", label: "Platforms", itemLabel: "text" }),
  backgroundImage: field(mediaRef.optional(), { control: "media", label: "Background image", accept: "image" }),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
