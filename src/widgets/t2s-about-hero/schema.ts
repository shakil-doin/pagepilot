import { z } from "zod";
import { field, widgetMeta, mediaRef } from "@/widgets/lib";
import { makeToneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-about-hero",
  name: "About Hero",
  category: "Hero",
  description: "Stacked headline lines, a founder intro with badge chips, and two intro columns",
});

export const schema = z.object({
  titleLines: field(
    z
      .array(z.object({ text: field(z.string().default("Headline line"), { control: "text", label: "Line" }) }))
      .default([]),
    { control: "list", label: "Headline lines", itemLabel: "text" },
  ),
  logo: field(mediaRef.optional(), { control: "media", label: "Avatar / logo", accept: "image" }),
  introHeading: field(z.string().optional(), { control: "textarea", label: "Intro heading" }),
  badges: field(
    z
      .array(
        z.object({
          icon: field(z.string().optional(), { control: "icon", label: "Icon" }),
          label: field(z.string().default("Badge"), { control: "text", label: "Label" }),
        }),
      )
      .default([]),
    { control: "list", label: "Badge chips", itemLabel: "label" },
  ),
  sideImage: field(mediaRef.optional(), { control: "media", label: "Side image", accept: "image" }),
  columns: field(
    z
      .array(z.object({ text: field(z.string().default("Paragraph"), { control: "textarea", label: "Text" }) }))
      .default([]),
    { control: "list", label: "Intro columns", itemLabel: "text" },
  ),
  tone: makeToneField("surface"),
});

export type Props = z.infer<typeof schema>;
