import { z } from "zod";
import { field, widgetMeta, mediaRef, linkRef } from "@/widgets/lib";
import { cardItem, introShape, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-lander-features",
  name: "Feature Cards + Awards",
  category: "Marketing",
  description: "Grid of icon-tile feature cards followed by a row of recognition badges",
});

export const schema = z.object({
  ...introShape,
  columns: field(z.number().int().min(2).max(4).default(4), {
    control: "segmented",
    label: "Columns",
    options: [
      { label: "2", value: 2 },
      { label: "3", value: 3 },
      { label: "4", value: 4 },
    ],
  }),
  items: field(z.array(cardItem).default([]), { control: "list", label: "Features", itemLabel: "title" }),
  recognitionTitle: field(z.string().optional(), { control: "text", label: "Awards title" }),
  badges: field(
    z
      .array(
        z.object({
          label: field(z.string().default("Award"), { control: "text", label: "Label" }),
          image: field(mediaRef.optional(), { control: "media", label: "Badge image", accept: "image" }),
          link: field(linkRef.optional(), { control: "link", label: "Link" }),
        }),
      )
      .default([]),
    { control: "list", label: "Award badges", itemLabel: "label" },
  ),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
