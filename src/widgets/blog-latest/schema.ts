import { z } from "zod";
import { field, widgetMeta } from "@/widgets/lib";

export const meta = widgetMeta({
  key: "blog-latest",
  name: "Latest Posts",
  category: "Content",
  description: "Cards for the most recent published blog posts",
});

export const schema = z.object({
  title: field(z.string().min(1).default("From the blog"), { control: "text", label: "Title" }),
  count: field(z.number().int().min(1).max(12).default(3), {
    control: "number",
    label: "Posts to show",
    min: 1,
    max: 12,
  }),
  showExcerpt: field(z.boolean().default(true), { control: "switch", label: "Show excerpt" }),
});

export type Props = z.infer<typeof schema>;
