import { z } from "zod";
import { field } from "@/widgets/lib";
import { alignField, cardItem, introShape, makeToneField, type Tone } from "@/widgets/t2s-lib";

// Builds the schema shared by every icon-card section, letting each widget set
// its own default column count and icon treatment.
export const iconCardsSchema = (defaults: {
  title: string;
  columns: number;
  iconStyle: "plain" | "soft" | "solid" | "circle";
  tone?: Tone;
  rule?: boolean;
}) =>
  z.object({
    ...introShape,
    title: field(z.string().default(defaults.title), { control: "text", label: "Title" }),
    align: alignField,
    rule: field(z.boolean().default(defaults.rule ?? false), { control: "switch", label: "Accent rule" }),
    columns: field(z.number().int().min(1).max(4).default(defaults.columns), {
      control: "segmented",
      label: "Columns",
      options: [
        { label: "1", value: 1 },
        { label: "2", value: 2 },
        { label: "3", value: 3 },
        { label: "4", value: 4 },
      ],
    }),
    iconStyle: field(z.enum(["plain", "soft", "solid", "circle"]).default(defaults.iconStyle), {
      control: "select",
      label: "Icon style",
      options: [
        { label: "Plain", value: "plain" },
        { label: "Soft tile", value: "soft" },
        { label: "Solid tile", value: "solid" },
        { label: "Gradient circle", value: "circle" },
      ],
    }),
    items: field(z.array(cardItem).default([]), { control: "list", label: "Cards", itemLabel: "title" }),
    tone: makeToneField(defaults.tone ?? "light"),
  });
