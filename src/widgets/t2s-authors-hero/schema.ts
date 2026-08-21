import { z } from "zod";
import { field, widgetMeta, mediaRef } from "@/widgets/lib";
import { toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-authors-hero",
  name: "Authors Hero",
  category: "Hero",
  description: "Page heading with intro paragraphs beside a framed photo",
});

export const schema = z.object({
  title: field(z.string().default("Meet the team behind the words"), { control: "textarea", label: "Title" }),
  body: field(z.string().default(""), { control: "richtext", label: "Body" }),
  image: field(mediaRef.optional(), { control: "media", label: "Photo", accept: "image" }),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
