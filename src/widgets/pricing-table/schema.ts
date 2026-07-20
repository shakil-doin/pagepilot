import { z } from "zod";
import { field, widgetMeta, buttonItem, sectionBackground } from "@/widgets/lib";

export const meta = widgetMeta({
  key: "pricing-table",
  name: "Pricing Table",
  category: "Marketing",
  description: "Side-by-side pricing plans with features and a highlighted option",
});

export const schema = z.object({
  title: field(z.string().optional(), { control: "text", label: "Title" }),
  description: field(z.string().optional(), { control: "textarea", label: "Description" }),
  plans: field(
    z
      .array(
        z.object({
          name: field(z.string().min(1).default("Starter"), { control: "text", label: "Name" }),
          price: field(z.string().min(1).default("$29"), { control: "text", label: "Price" }),
          period: field(z.string().optional(), { control: "text", label: "Period", placeholder: "per month" }),
          description: field(z.string().optional(), { control: "textarea", label: "Description" }),
          features: field(
            z
              .array(
                z.object({
                  text: field(z.string().min(1).default("Feature"), { control: "text", label: "Text" }),
                }),
              )
              .default([]),
            { control: "list", label: "Features", itemLabel: "text" },
          ),
          button: field(buttonItem.optional(), { control: "group", label: "Button" }),
          highlighted: field(z.boolean().default(false), { control: "switch", label: "Highlighted" }),
        }),
      )
      .default([]),
    { control: "list", label: "Plans", itemLabel: "name" },
  ),
  background: sectionBackground,
});

export type Props = z.infer<typeof schema>;
