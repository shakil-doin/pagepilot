import { z } from "zod";
import { field, widgetMeta, buttonItem } from "@/widgets/lib";
import { checkItem, introShape, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-markets-grid",
  name: "Market Cards",
  category: "Marketing",
  description: "Swipeable market cards, each with an icon, CTA, a sample signal box and chips",
});

export const schema = z.object({
  ...introShape,
  signalLabel: field(z.string().default("Signal"), { control: "text", label: "Signal label" }),
  signalTime: field(z.string().optional(), { control: "text", label: "Signal time" }),
  cards: field(
    z
      .array(
        z.object({
          icon: field(z.string().optional(), { control: "icon", label: "Icon" }),
          title: field(z.string().default("Market"), { control: "text", label: "Title" }),
          description: field(z.string().optional(), { control: "textarea", label: "Description" }),
          buttons: field(z.array(buttonItem).default([]), { control: "list", label: "Buttons", itemLabel: "label" }),
          signalText: field(z.string().optional(), { control: "text", label: "Signal text" }),
          signalStatus: field(z.string().optional(), { control: "text", label: "Signal status" }),
          chips: field(z.array(checkItem).default([]), { control: "list", label: "Chips", itemLabel: "text" }),
        }),
      )
      .default([]),
    { control: "list", label: "Markets", itemLabel: "title" },
  ),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
