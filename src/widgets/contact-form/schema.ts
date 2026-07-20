import { z } from "zod";
import { field, widgetMeta } from "@/widgets/lib";

export const meta = widgetMeta({
  key: "contact-form",
  name: "Contact Form",
  category: "Marketing",
  description: "Name, email, and message form that submits to the forms API",
});

export const schema = z.object({
  title: field(z.string().optional(), { control: "text", label: "Title" }),
  description: field(z.string().optional(), { control: "textarea", label: "Description" }),
  submitLabel: field(z.string().min(1).default("Send message"), { control: "text", label: "Submit label" }),
  showPhone: field(z.boolean().default(false), { control: "switch", label: "Show phone field" }),
  showCompany: field(z.boolean().default(false), { control: "switch", label: "Show company field" }),
});

export type Props = z.infer<typeof schema>;
