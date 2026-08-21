import { z } from "zod";
import { field, widgetMeta } from "@/widgets/lib";
import { introShape, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-tools-steps",
  name: "Numbered Steps + Note",
  category: "Process",
  description: "Compact numbered step cards followed by a bordered note callout",
});

export const schema = z.object({
  ...introShape,
  columns: field(z.number().int().min(2).max(4).default(3), {
    control: "segmented",
    label: "Columns",
    options: [
      { label: "2", value: 2 },
      { label: "3", value: 3 },
      { label: "4", value: 4 },
    ],
  }),
  steps: field(
    z
      .array(
        z.object({
          title: field(z.string().default("Step"), { control: "text", label: "Title" }),
          description: field(z.string().optional(), { control: "textarea", label: "Description" }),
        }),
      )
      .default([]),
    { control: "list", label: "Steps", itemLabel: "title" },
  ),
  noteLabel: field(z.string().default("Note:"), { control: "text", label: "Note label" }),
  note: field(z.string().optional(), { control: "textarea", label: "Note" }),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
