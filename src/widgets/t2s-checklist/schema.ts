import { z } from "zod";
import { field, widgetMeta } from "@/widgets/lib";
import { checkItem, introShape, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-checklist",
  name: "Checklist Split",
  category: "Content",
  description: "Section intro beside a column of tinted checklist rows",
});

export const schema = z.object({
  ...introShape,
  align: field(z.enum(["center", "left"]).default("left"), { control: "segmented", label: "Align" }),
  items: field(z.array(checkItem).default([]), { control: "list", label: "Checklist", itemLabel: "text" }),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
