import { z } from "zod";
import { field, widgetMeta } from "@/widgets/lib";
import { alignField, compareRow, introShape, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-comparison",
  name: "Before / After Cards",
  category: "Compare",
  description: "Two stacked cards — the old way vs the new way — split by a VS divider",
});

export const schema = z.object({
  ...introShape,
  align: alignField,
  divider: field(z.string().default("VS"), { control: "text", label: "Divider label" }),
  oldTitle: field(z.string().default("The old way"), { control: "text", label: "Left card title" }),
  oldBadge: field(z.string().default("Manual"), { control: "text", label: "Left card badge" }),
  oldItems: field(z.array(compareRow).default([]), { control: "list", label: "Left card rows", itemLabel: "text" }),
  newTitle: field(z.string().default("The new way"), { control: "text", label: "Right card title" }),
  newBadge: field(z.string().default("Automated"), { control: "text", label: "Right card badge" }),
  newItems: field(z.array(compareRow).default([]), { control: "list", label: "Right card rows", itemLabel: "text" }),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
