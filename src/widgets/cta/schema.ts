import { z } from "zod";
import { field, widgetMeta, buttonItem } from "@/widgets/lib";

export const meta = widgetMeta({
  key: "cta",
  name: "Call to Action",
  category: "Marketing",
  description: "Full-width closing banner with headline and buttons",
});

export const schema = z.object({
  headline: field(z.string().min(1).default("Ready to get started?"), {
    control: "text",
    label: "Headline",
  }),
  subtext: field(z.string().optional(), { control: "textarea", label: "Subtext" }),
  buttons: field(z.array(buttonItem).default([]), {
    control: "list",
    label: "Buttons",
    itemLabel: "label",
  }),
  style: field(z.enum(["gradient", "secondary", "surface"]).default("gradient"), {
    control: "segmented",
    label: "Style",
  }),
});

export type Props = z.infer<typeof schema>;
