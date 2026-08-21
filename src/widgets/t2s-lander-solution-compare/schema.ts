import { z } from "zod";
import { field, widgetMeta, mediaRef, buttonItem } from "@/widgets/lib";
import { introShape, makeToneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-lander-solution-compare",
  name: "Manual vs Automated",
  category: "Compare",
  description: "Side-by-side panels: a messy stack of manual alerts against a clean automated trade log",
});

export const schema = z.object({
  ...introShape,
  flowImage: field(mediaRef.optional(), { control: "media", label: "Flow diagram", accept: "image" }),

  withoutBadge: field(z.string().default("Without automation"), { control: "text", label: "Left badge" }),
  withoutTitle: field(z.string().default("Signals pile up"), { control: "text", label: "Left title" }),
  withoutText: field(z.string().optional(), { control: "textarea", label: "Left text" }),
  withoutTag: field(z.string().optional(), { control: "text", label: "Left tag" }),
  withoutCards: field(
    z
      .array(
        z.object({
          label: field(z.string().default("Channel"), { control: "text", label: "Label" }),
          text: field(z.string().optional(), { control: "text", label: "Text" }),
          icon: field(z.string().optional(), { control: "icon", label: "Icon" }),
          accent: field(z.enum(["primary", "warning", "danger"]).default("primary"), {
            control: "segmented",
            label: "Accent",
          }),
          tilt: field(z.number().min(-15).max(15).default(0), {
            control: "slider",
            label: "Tilt",
            min: -15,
            max: 15,
            step: 1,
          }),
          left: field(z.number().min(0).max(60).default(4), { control: "slider", label: "Left %", min: 0, max: 60, step: 1 }),
          top: field(z.number().min(0).max(80).default(0), { control: "slider", label: "Top %", min: 0, max: 80, step: 1 }),
        }),
      )
      .default([]),
    { control: "list", label: "Stacked alert cards", itemLabel: "label" },
  ),

  withBadge: field(z.string().default("With automation"), { control: "text", label: "Right badge" }),
  withTitle: field(z.string().default("Trades execute themselves"), { control: "text", label: "Right title" }),
  withText: field(z.string().optional(), { control: "textarea", label: "Right text" }),
  withTag: field(z.string().optional(), { control: "text", label: "Right tag" }),
  logTitle: field(z.string().default("Trade log"), { control: "text", label: "Log title" }),
  logStatus: field(z.string().default("Live"), { control: "text", label: "Log status" }),
  rows: field(
    z
      .array(
        z.object({
          symbol: field(z.string().default("XAUUSD"), { control: "text", label: "Symbol" }),
          side: field(z.enum(["BUY", "SELL"]).default("BUY"), { control: "segmented", label: "Side" }),
          status: field(z.string().default("Filled"), { control: "text", label: "Status" }),
        }),
      )
      .default([]),
    { control: "list", label: "Trade rows", itemLabel: "symbol" },
  ),

  stats: field(
    z
      .array(
        z.object({
          value: field(z.string().default("0.5s"), { control: "text", label: "Value" }),
          label: field(z.string().default("Label"), { control: "text", label: "Label" }),
          text: field(z.string().optional(), { control: "text", label: "Note" }),
        }),
      )
      .default([]),
    { control: "list", label: "Stat bullets", itemLabel: "label" },
  ),

  footerText: field(z.string().optional(), { control: "text", label: "Footer text" }),
  buttons: field(z.array(buttonItem).default([]), { control: "list", label: "Footer buttons", itemLabel: "label" }),
  tone: makeToneField("dark"),
  rounded: field(z.boolean().default(true), { control: "switch", label: "Rounded panel" }),
});

export type Props = z.infer<typeof schema>;
