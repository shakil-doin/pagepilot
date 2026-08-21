import { z } from "zod";
import { field, widgetMeta, buttonItem } from "@/widgets/lib";
import { toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-authors-legal",
  name: "Disclosure Box",
  category: "Content",
  description: "Boxed legal or disclosure copy followed by a centered button",
});

export const schema = z.object({
  title: field(z.string().default("Legal disclosure"), { control: "text", label: "Title" }),
  rule: field(z.boolean().default(true), { control: "switch", label: "Accent rule" }),
  body: field(z.string().default(""), { control: "richtext", label: "Body" }),
  buttons: field(z.array(buttonItem).default([]), { control: "list", label: "Buttons", itemLabel: "label" }),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
