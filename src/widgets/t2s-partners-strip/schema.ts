import { z } from "zod";
import { field, widgetMeta } from "@/widgets/lib";
import { logoItem, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-partners-strip",
  name: "Partners Strip",
  category: "Proof",
  description: "Heading over a bordered row of evenly divided partner logos",
});

export const schema = z.object({
  title: field(z.string().default("Trusted by"), { control: "text", label: "Title" }),
  items: field(z.array(logoItem).default([]), { control: "list", label: "Logos", itemLabel: "name" }),
  grayscale: field(z.boolean().default(false), { control: "switch", label: "Grayscale logos" }),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
