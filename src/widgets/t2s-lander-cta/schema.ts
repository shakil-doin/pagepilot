import { z } from "zod";
import { field, widgetMeta, buttonItem } from "@/widgets/lib";
import { makeToneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-lander-cta",
  name: "Gradient CTA Banner",
  category: "Marketing",
  description: "Rounded gradient banner with badge, headline and a single call to action",
});

export const schema = z.object({
  badge: field(z.string().optional(), { control: "text", label: "Badge" }),
  title: field(z.string().default("Ready to get started?"), { control: "textarea", label: "Title" }),
  description: field(z.string().optional(), { control: "textarea", label: "Description" }),
  buttons: field(z.array(buttonItem).default([]), { control: "list", label: "Buttons", itemLabel: "label" }),
  tone: makeToneField("brand"),
  rounded: field(z.boolean().default(true), { control: "switch", label: "Rounded panel" }),
});

export type Props = z.infer<typeof schema>;
