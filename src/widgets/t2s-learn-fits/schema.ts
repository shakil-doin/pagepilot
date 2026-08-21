import { z } from "zod";
import { field, widgetMeta, buttonItem } from "@/widgets/lib";
import { checkItem, introShape, makeToneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-learn-fits",
  name: "Steps Pills CTA",
  category: "Education",
  description: "Dark panel with an intro, a row of step pills and a closing call to action",
});

export const schema = z.object({
  ...introShape,
  steps: field(z.array(checkItem).default([]), { control: "list", label: "Step pills", itemLabel: "text" }),
  buttons: field(z.array(buttonItem).default([]), { control: "list", label: "Buttons", itemLabel: "label" }),
  tone: makeToneField("dark"),
  rounded: field(z.boolean().default(true), { control: "switch", label: "Rounded panel" }),
});

export type Props = z.infer<typeof schema>;
