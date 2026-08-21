import { z } from "zod";
import { field, widgetMeta, buttonItem } from "@/widgets/lib";
import { introShape, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-about-cta",
  name: "Centered CTA",
  category: "Marketing",
  description: "Badge, headline, supporting line and a centered row of buttons",
});

export const schema = z.object({
  ...introShape,
  icon: field(z.string().optional(), { control: "icon", label: "Badge icon" }),
  buttons: field(z.array(buttonItem).default([]), { control: "list", label: "Buttons", itemLabel: "label" }),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
