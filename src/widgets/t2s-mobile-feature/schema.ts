import { z } from "zod";
import { field, widgetMeta, mediaRef } from "@/widgets/lib";
import { alignField, cardItem, introShape, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-mobile-feature",
  name: "App Showcase",
  category: "Marketing",
  description: "Feature cards flanking a tall device screenshot in the middle",
});

export const schema = z.object({
  ...introShape,
  align: alignField,
  cards: field(z.array(cardItem).default([]), { control: "list", label: "Cards", itemLabel: "title" }),
  image: field(mediaRef.optional(), { control: "media", label: "Device image", accept: "image" }),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
