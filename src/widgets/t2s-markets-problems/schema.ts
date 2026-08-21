import { z } from "zod";
import { field, widgetMeta } from "@/widgets/lib";
import { introShape, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-markets-problems",
  name: "Problems + Stat Tiles",
  category: "Marketing",
  description: "Intro beside an icon problem list, over a row of glowing stat tiles",
});

export const schema = z.object({
  ...introShape,
  problems: field(
    z
      .array(
        z.object({
          icon: field(z.string().optional(), { control: "icon", label: "Icon" }),
          title: field(z.string().default("Problem"), { control: "text", label: "Title" }),
          subtitle: field(z.string().optional(), { control: "text", label: "Subtitle" }),
        }),
      )
      .default([]),
    { control: "list", label: "Problems", itemLabel: "title" },
  ),
  stats: field(
    z
      .array(
        z.object({
          value: field(z.string().default("70%"), { control: "text", label: "Value" }),
          label: field(z.string().default("Label"), { control: "text", label: "Label" }),
          description: field(z.string().optional(), { control: "text", label: "Description" }),
        }),
      )
      .default([]),
    { control: "list", label: "Stats", itemLabel: "label" },
  ),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
