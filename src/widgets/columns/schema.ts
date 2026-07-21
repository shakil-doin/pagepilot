import { z } from "zod";
import { field, widgetMeta, sectionBackground } from "@/widgets/lib";

export const meta = widgetMeta({
  key: "columns",
  name: "Columns",
  category: "Layout",
  description: "A 2 to 4 column container that holds other widgets",
  primitive: true,
});

export const schema = z.object({
  count: field(z.number().int().min(2).max(6).default(2), {
    control: "segmented",
    label: "Columns",
    options: [
      { label: "2", value: 2 },
      { label: "3", value: 3 },
      { label: "4", value: 4 },
      { label: "5", value: 5 },
      { label: "6", value: 6 },
    ],
    responsive: true,
  }),
  gap: field(z.enum(["sm", "md", "lg"]).default("md"), { control: "segmented", label: "Gap" }),
  verticalAlign: field(z.enum(["top", "center", "bottom"]).default("top"), {
    control: "segmented",
    label: "Vertical align",
  }),
  background: sectionBackground,
});

export type Props = z.infer<typeof schema>;
