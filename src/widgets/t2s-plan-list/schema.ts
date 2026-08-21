import { z } from "zod";
import { field, widgetMeta, linkRef } from "@/widgets/lib";
import { checkItem, introShape, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-plan-list",
  name: "Plan Cards + Billing Toggle",
  category: "Pricing",
  description: "Monthly/yearly toggle over pricing cards with save badges and feature lists",
});

// Prices live as strings: they carry currency symbols, cents and struck-through
// old prices that a number field would mangle.

export const schema = z.object({
  ...introShape,
  title: field(z.string().optional(), { control: "text", label: "Title" }),
  monthlyLabel: field(z.string().default("Monthly"), { control: "text", label: "Monthly label" }),
  yearlyLabel: field(z.string().default("Yearly"), { control: "text", label: "Yearly label" }),
  toggleBadge: field(z.string().optional(), { control: "text", label: "Toggle badge", placeholder: "2 months free" }),
  defaultCycle: field(z.enum(["monthly", "yearly"]).default("yearly"), {
    control: "segmented",
    label: "Default cycle",
  }),
  yearlyRibbon: field(z.string().optional(), { control: "text", label: "Yearly card ribbon" }),
  plans: field(
    z
      .array(
        z.object({
          name: field(z.string().default("Plan"), { control: "text", label: "Name" }),
          subtitle: field(z.string().optional(), { control: "text", label: "Subtitle" }),
          popular: field(z.boolean().default(false), { control: "switch", label: "Most popular" }),
          popularLabel: field(z.string().optional(), { control: "text", label: "Popular label" }),
          monthlyPrice: field(z.string().default("$0"), { control: "text", label: "Monthly price" }),
          monthlyOldPrice: field(z.string().optional(), { control: "text", label: "Monthly old price" }),
          monthlyPeriod: field(z.string().optional(), { control: "text", label: "Monthly period", placeholder: "/month" }),
          monthlyNote: field(z.string().optional(), { control: "text", label: "Monthly total note" }),
          monthlySave: field(z.string().optional(), { control: "text", label: "Monthly save text" }),
          yearlyPrice: field(z.string().default("$0"), { control: "text", label: "Yearly price" }),
          yearlyOldPrice: field(z.string().optional(), { control: "text", label: "Yearly old price" }),
          yearlyPeriod: field(z.string().optional(), { control: "text", label: "Yearly period", placeholder: "/month" }),
          yearlyNote: field(z.string().optional(), { control: "text", label: "Yearly total note" }),
          yearlySave: field(z.string().optional(), { control: "text", label: "Yearly save text" }),
          yearlyHint: field(z.string().optional(), { control: "text", label: "Yearly hint" }),
          ctaLabel: field(z.string().default("Get started"), { control: "text", label: "Button label" }),
          ctaLink: field(linkRef.default({ href: "#" }), { control: "link", label: "Button link" }),
          featuresTitle: field(z.string().optional(), { control: "text", label: "Features heading" }),
          features: field(z.array(checkItem).default([]), { control: "list", label: "Features", itemLabel: "text" }),
        }),
      )
      .default([]),
    { control: "list", label: "Plans", itemLabel: "name" },
  ),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
export type Plan = Props["plans"][number];
