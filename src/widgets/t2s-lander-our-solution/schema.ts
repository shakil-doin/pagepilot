import { z } from "zod";
import { field, widgetMeta } from "@/widgets/lib";
import { introShape, makeToneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-lander-our-solution",
  name: "Solution Stepper",
  category: "Process",
  description: "Dark panel with a progress stepper above icon-led solution steps",
});

export const schema = z.object({
  ...introShape,
  stepper: field(
    z
      .array(
        z.object({
          label: field(z.string().default("Step"), { control: "text", label: "Label" }),
          done: field(z.boolean().default(false), { control: "switch", label: "Completed" }),
        }),
      )
      .default([]),
    { control: "list", label: "Stepper nodes", itemLabel: "label" },
  ),
  steps: field(
    z
      .array(
        z.object({
          icon: field(z.string().optional(), { control: "icon", label: "Icon" }),
          step: field(z.string().optional(), { control: "text", label: "Step pill" }),
          title: field(z.string().default("Step title"), { control: "text", label: "Title" }),
          text: field(z.string().optional(), { control: "textarea", label: "Text" }),
          check: field(z.string().optional(), { control: "text", label: "Check line" }),
        }),
      )
      .default([]),
    { control: "list", label: "Steps", itemLabel: "title" },
  ),
  tone: makeToneField("dark"),
  rounded: field(z.boolean().default(true), { control: "switch", label: "Rounded panel" }),
});

export type Props = z.infer<typeof schema>;
