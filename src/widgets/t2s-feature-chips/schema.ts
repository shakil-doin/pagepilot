import { z } from "zod";
import { field, widgetMeta } from "@/widgets/lib";
import { checkItem, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-feature-chips",
  name: "Feature Chips",
  category: "Content",
  description: "Row of rounded checkmark chips, usually placed under a hero",
});

export const schema = z.object({
  items: field(z.array(checkItem).default([]), { control: "list", label: "Chips", itemLabel: "text" }),
  align: field(z.enum(["center", "left"]).default("center"), { control: "segmented", label: "Align" }),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
