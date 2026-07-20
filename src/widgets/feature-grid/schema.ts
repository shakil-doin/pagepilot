import { z } from "zod";
import { field, widgetMeta, mediaRef, linkRef, sectionBackground } from "@/widgets/lib";

export const meta = widgetMeta({
  key: "feature-grid",
  name: "Feature Grid",
  category: "Marketing",
  description: "Icon + title + text cards in a responsive grid",
});

export const schema = z.object({
  title: field(z.string().optional(), { control: "text", label: "Title" }),
  description: field(z.string().optional(), { control: "textarea", label: "Description" }),
  columns: field(z.number().int().min(2).max(4).default(3), {
    control: "segmented",
    label: "Columns (desktop)",
    options: [
      { label: "2", value: 2 },
      { label: "3", value: 3 },
      { label: "4", value: 4 },
    ],
    responsive: true,
  }),
  items: field(
    z
      .array(
        z.object({
          icon: field(z.string().optional(), { control: "icon", label: "Icon" }),
          title: field(z.string().min(1), { control: "text", label: "Title" }),
          text: field(z.string().optional(), { control: "textarea", label: "Text" }),
          image: field(mediaRef.optional(), { control: "media", label: "Image", accept: "image" }),
          link: field(linkRef.optional(), { control: "link", label: "Link" }),
        }),
      )
      .default([]),
    { control: "list", label: "Items", itemLabel: "title" },
  ),
  background: sectionBackground,
});

export type Props = z.infer<typeof schema>;
