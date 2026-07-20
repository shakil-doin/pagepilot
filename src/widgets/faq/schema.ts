import { z } from "zod";
import { field, widgetMeta, sectionBackground } from "@/widgets/lib";

export const meta = widgetMeta({
  key: "faq",
  name: "FAQ",
  category: "Marketing",
  description: "Accordion of questions; emits FAQ structured data automatically",
});

export const schema = z.object({
  title: field(z.string().default("Frequently asked questions"), { control: "text", label: "Title" }),
  items: field(
    z
      .array(
        z.object({
          question: field(z.string().min(1).default("Question goes here?"), { control: "text", label: "Question" }),
          answer: field(z.string().min(1).default("Answer goes here."), { control: "textarea", label: "Answer" }),
        }),
      )
      .default([]),
    { control: "list", label: "Questions", itemLabel: "question" },
  ),
  background: sectionBackground,
});

export type Props = z.infer<typeof schema>;
