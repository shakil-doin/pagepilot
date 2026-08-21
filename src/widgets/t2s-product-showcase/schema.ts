import { z } from "zod";
import { field, widgetMeta, mediaRef, buttonItem } from "@/widgets/lib";
import { checkItem, introShape, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-product-showcase",
  name: "Product Tabs Showcase",
  category: "Marketing",
  description: "Left-rail tabs switching a panel of copy, feature checks, CTA and a screenshot",
});

export const schema = z.object({
  ...introShape,
  tabs: field(
    z
      .array(
        z.object({
          icon: field(z.string().optional(), { control: "icon", label: "Tab icon" }),
          label: field(z.string().default("Tab"), { control: "text", label: "Tab label" }),
          title: field(z.string().default("Panel title"), { control: "text", label: "Panel title" }),
          description: field(z.string().optional(), { control: "textarea", label: "Panel description" }),
          features: field(z.array(checkItem).default([]), { control: "list", label: "Features", itemLabel: "text" }),
          buttons: field(z.array(buttonItem).default([]), { control: "list", label: "Buttons", itemLabel: "label" }),
          image: field(mediaRef.optional(), { control: "media", label: "Screenshot", accept: "image" }),
        }),
      )
      .default([]),
    { control: "list", label: "Tabs", itemLabel: "label" },
  ),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
export type ShowcaseTab = Props["tabs"][number];
