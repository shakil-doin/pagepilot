import { z } from "zod";
import { field, widgetMeta, linkRef } from "@/widgets/lib";
import { introShape, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-faq",
  name: "FAQ + Support Card",
  category: "Content",
  description: "Two-column FAQ: intro and a support card on the left, accordion on the right",
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
  ctaTitle: field(z.string().optional(), { control: "text", label: "Support card title" }),
  ctaDescription: field(z.string().optional(), { control: "textarea", label: "Support card text" }),
  ctaLabel: field(z.string().optional(), { control: "text", label: "Support card button" }),
  ctaLink: field(linkRef.optional(), { control: "link", label: "Support card link" }),
  emitJsonLd: field(z.boolean().default(true), {
    control: "switch",
    label: "FAQ structured data",
    description: "Emits FAQPage JSON-LD for search engines",
  }),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
