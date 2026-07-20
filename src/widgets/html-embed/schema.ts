import { z } from "zod";
import { field, widgetMeta } from "@/widgets/lib";

export const meta = widgetMeta({
  key: "html-embed",
  name: "HTML Embed",
  category: "Basic",
  description: "Raw HTML block, sanitized. Admins only.",
  primitive: true,
  adminOnly: true,
});

export const schema = z.object({
  html: field(z.string().default(""), {
    control: "textarea",
    label: "HTML",
    description: "Scripts are stripped. Iframes allowed from YouTube and Vimeo only.",
  }),
});

export type Props = z.infer<typeof schema>;
