import { z } from "zod";
import { field, widgetMeta } from "@/widgets/lib";
import { introShape, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-learn-choose",
  name: "Choose Cards",
  category: "Education",
  description: "Framed solid-colour panels contrasting two choices side by side",
});

export const schema = z.object({
  ...introShape,
  cards: field(
    z
      .array(
        z.object({
          badge: field(z.string().optional(), { control: "text", label: "Badge" }),
          title: field(z.string().default("Choice"), { control: "text", label: "Title" }),
          text: field(z.string().optional(), { control: "textarea", label: "Text" }),
          accent: field(z.enum(["primary", "secondary"]).default("primary"), {
            control: "segmented",
            label: "Panel colour",
          }),
        }),
      )
      .default([]),
    { control: "list", label: "Cards", itemLabel: "title" },
  ),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
