import { z } from "zod";
import { field, widgetMeta, buttonItem } from "@/widgets/lib";

export const meta = widgetMeta({
  key: "button-row",
  name: "Buttons",
  category: "Basic",
  description: "One or more call-to-action buttons in a row",
  primitive: true,
});

export const schema = z.object({
  // Starts with a single button (a non-empty default stops the manifest from
  // seeding the usual three sample items). Add more from the inspector list.
  buttons: field(z.array(buttonItem).min(1).default([{ label: "Button", link: { href: "#" }, variant: "primary" }]), {
    control: "list",
    label: "Buttons",
    itemLabel: "label",
  }),
  align: field(z.enum(["left", "center", "right"]).default("left"), {
    control: "segmented",
    label: "Align",
  }),
  size: field(z.enum(["md", "lg"]).default("md"), { control: "segmented", label: "Size" }),
});

export type Props = z.infer<typeof schema>;
