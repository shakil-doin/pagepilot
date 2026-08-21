import { z } from "zod";
import { field, widgetMeta } from "@/widgets/lib";
import { alignField, introShape, logoItem, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-logo-marquee",
  name: "Broker Logo Marquee",
  category: "Proof",
  description: "Centered intro over an auto-scrolling strip of partner or broker logos",
});

export const schema = z.object({
  ...introShape,
  align: alignField,
  logos: field(z.array(logoItem).default([]), { control: "list", label: "Logos", itemLabel: "name" }),
  speed: field(z.enum(["slow", "normal", "fast"]).default("normal"), { control: "segmented", label: "Speed" }),
  grayscale: field(z.boolean().default(false), { control: "switch", label: "Grayscale logos" }),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
