import { z } from "zod";
import { field, widgetMeta } from "@/widgets/lib";
import { alignField, introShape, makeToneField, reviewItem } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-review",
  name: "Review Marquee",
  category: "Proof",
  description: "Two auto-scrolling rows of customer review cards on a dark panel",
});

export const schema = z.object({
  ...introShape,
  align: alignField,
  tagLabel: field(z.string().optional(), { control: "text", label: "Tag chip" }),
  tagText: field(z.string().optional(), { control: "text", label: "Tag text" }),
  rowOne: field(z.array(reviewItem).default([]), { control: "list", label: "Row 1 reviews", itemLabel: "name" }),
  rowTwo: field(z.array(reviewItem).default([]), { control: "list", label: "Row 2 reviews", itemLabel: "name" }),
  speed: field(z.enum(["slow", "normal", "fast"]).default("normal"), { control: "segmented", label: "Speed" }),
  tone: makeToneField("dark"),
  rounded: field(z.boolean().default(true), { control: "switch", label: "Rounded panel" }),
});

export type Props = z.infer<typeof schema>;
