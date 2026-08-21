import { z } from "zod";
import { field, widgetMeta } from "@/widgets/lib";
import { toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-lander-featured-in",
  name: "Featured In Ticker",
  category: "Proof",
  description: "Scrolling row of press outlet names set as bold wordmarks",
});

export const schema = z.object({
  title: field(z.string().default("As featured in"), { control: "text", label: "Title" }),
  outlets: field(
    z
      .array(
        z.object({
          name: field(z.string().default("Outlet"), { control: "text", label: "Name" }),
          italic: field(z.boolean().default(false), { control: "switch", label: "Italic" }),
        }),
      )
      .default([]),
    { control: "list", label: "Outlets", itemLabel: "name" },
  ),
  speed: field(z.enum(["slow", "normal", "fast"]).default("normal"), { control: "segmented", label: "Speed" }),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
