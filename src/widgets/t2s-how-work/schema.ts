import { z } from "zod";
import { field, widgetMeta, mediaRef } from "@/widgets/lib";
import { alignField, introShape, makeToneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-how-work",
  name: "How It Works Steps",
  category: "Process",
  description: "Numbered progress bar over a stack of large step cards with pill, title and visual",
});

export const schema = z.object({
  ...introShape,
  align: alignField,
  steps: field(
    z
      .array(
        z.object({
          label: field(z.string().default("Step"), { control: "text", label: "Stepper label" }),
          pill: field(z.string().optional(), { control: "text", label: "Pill" }),
          title: field(z.string().default("Step title"), { control: "text", label: "Title" }),
          description: field(z.string().optional(), { control: "textarea", label: "Description" }),
          image: field(mediaRef.optional(), { control: "media", label: "Visual", accept: "image" }),
        }),
      )
      .default([]),
    { control: "list", label: "Steps", itemLabel: "title" },
  ),
  tone: makeToneField("dark"),
  rounded: field(z.boolean().default(true), { control: "switch", label: "Rounded panel" }),
});

export type Props = z.infer<typeof schema>;
