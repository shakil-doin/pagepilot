import { z } from "zod";
import { field } from "@/widgets/lib";
import { alignField, makeToneField, type Tone } from "@/widgets/t2s-lib";

export const statementSchema = (defaults: { title: string; tone?: Tone }) =>
  z.object({
    badge: field(z.string().optional(), { control: "text", label: "Badge" }),
    title: field(z.string().default(defaults.title), { control: "text", label: "Title" }),
    body: field(z.string().default(""), { control: "richtext", label: "Body" }),
    align: alignField,
    tone: makeToneField(defaults.tone ?? "surface"),
  });
