import { z } from "zod";
import { field, widgetMeta, sectionBackground } from "@/widgets/lib";

export const meta = widgetMeta({
  key: "newsletter",
  name: "Newsletter",
  category: "Marketing",
  description: "Email signup form that submits to the forms API",
});

export const schema = z.object({
  title: field(z.string().min(1).default("Subscribe to our newsletter"), { control: "text", label: "Title" }),
  description: field(z.string().optional(), { control: "textarea", label: "Description" }),
  submitLabel: field(z.string().min(1).default("Subscribe"), { control: "text", label: "Submit label" }),
  background: sectionBackground,
});

export type Props = z.infer<typeof schema>;
