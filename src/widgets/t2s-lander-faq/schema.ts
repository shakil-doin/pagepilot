import { z } from "zod";
import { field, widgetMeta } from "@/widgets/lib";
import { introShape, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-lander-faq",
  name: "Centered FAQ",
  category: "Content",
  description: "Centered intro over a single column of accordion questions",
});

export const schema = z.object({
  ...introShape,
  items: field(
    z
      .array(
        z.object({
          question: field(z.string().default("Question"), { control: "text", label: "Question" }),
          answer: field(z.string().default("Answer"), { control: "textarea", label: "Answer" }),
        }),
      )
      .default([]),
    { control: "list", label: "Questions", itemLabel: "question" },
  ),
  openFirst: field(z.boolean().default(true), { control: "switch", label: "Open first item" }),
  emitJsonLd: field(z.boolean().default(true), { control: "switch", label: "FAQ structured data" }),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
