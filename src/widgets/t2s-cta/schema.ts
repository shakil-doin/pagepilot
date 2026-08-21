import { z } from "zod";
import { field, widgetMeta, mediaRef, buttonItem, linkRef } from "@/widgets/lib";
import { makeToneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-cta",
  name: "App CTA Panel",
  category: "Marketing",
  description: "Gradient closing panel with buttons, app store badges and a device shot",
});

export const schema = z.object({
  title: field(z.string().default("Start copying trades today"), { control: "textarea", label: "Title" }),
  description: field(z.string().optional(), { control: "textarea", label: "Description" }),
  buttons: field(z.array(buttonItem).default([]), { control: "list", label: "Buttons", itemLabel: "label" }),
  storeLabel: field(z.string().optional(), { control: "text", label: "Store row label", placeholder: "Download now" }),
  stores: field(
    z
      .array(
        z.object({
          label: field(z.string().default("App Store"), { control: "text", label: "Label" }),
          badge: field(mediaRef.optional(), { control: "media", label: "Badge image", accept: "image" }),
          link: field(linkRef.default({ href: "#" }), { control: "link", label: "Link" }),
          comingSoon: field(z.boolean().default(false), { control: "switch", label: "Coming soon" }),
        }),
      )
      .default([]),
    { control: "list", label: "Store badges", itemLabel: "label" },
  ),
  image: field(mediaRef.optional(), { control: "media", label: "Device image", accept: "image" }),
  tone: makeToneField("brand"),
  rounded: field(z.boolean().default(true), { control: "switch", label: "Rounded panel" }),
});

export type Props = z.infer<typeof schema>;
