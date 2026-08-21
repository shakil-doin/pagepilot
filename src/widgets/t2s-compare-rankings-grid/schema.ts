import { z } from "zod";
import { field, widgetMeta, linkRef, buttonItem } from "@/widgets/lib";
import { checkItem, introShape, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-compare-rankings-grid",
  name: "Rankings Grid",
  category: "Compare",
  description: "Competitor cards flanking one featured pick in the middle column",
});

export const schema = z.object({
  ...introShape,
  featuredName: field(z.string().default("Our pick"), { control: "text", label: "Featured name" }),
  featuredBadge: field(z.string().optional(), { control: "text", label: "Featured badge" }),
  featuredTagline: field(z.string().optional(), { control: "textarea", label: "Featured tagline" }),
  featuredItems: field(z.array(checkItem).default([]), { control: "list", label: "Featured points", itemLabel: "text" }),
  featuredButtons: field(z.array(buttonItem).default([]), { control: "list", label: "Featured buttons", itemLabel: "label" }),
  competitors: field(
    z
      .array(
        z.object({
          name: field(z.string().default("Competitor"), { control: "text", label: "Name" }),
          rating: field(z.number().min(0).max(5).default(4), {
            control: "slider",
            label: "Rating",
            min: 0,
            max: 5,
            step: 0.5,
          }),
          items: field(z.array(checkItem).default([]), { control: "list", label: "Points", itemLabel: "text" }),
          linkLabel: field(z.string().default("Compare"), { control: "text", label: "Link label" }),
          link: field(linkRef.default({ href: "#" }), { control: "link", label: "Link" }),
        }),
      )
      .default([]),
    { control: "list", label: "Competitors", itemLabel: "name" },
  ),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
export type Competitor = Props["competitors"][number];
