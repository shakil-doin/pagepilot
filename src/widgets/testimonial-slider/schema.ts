import { z } from "zod";
import { field, widgetMeta, mediaRef, sectionBackground } from "@/widgets/lib";

export const meta = widgetMeta({
  key: "testimonial-slider",
  name: "Testimonial Slider",
  category: "Marketing",
  description: "Rotating customer quotes with avatars and star ratings",
});

export const schema = z.object({
  title: field(z.string().optional(), { control: "text", label: "Title" }),
  items: field(
    z
      .array(
        z.object({
          quote: field(z.string().min(1).default("This product changed the way our team works."), {
            control: "textarea",
            label: "Quote",
          }),
          name: field(z.string().min(1).default("Jane Doe"), { control: "text", label: "Name" }),
          role: field(z.string().optional(), { control: "text", label: "Role" }),
          avatar: field(mediaRef.optional(), { control: "media", label: "Avatar", accept: "image" }),
          rating: field(z.number().int().min(1).max(5).optional(), {
            control: "number",
            label: "Rating (1-5)",
            min: 1,
            max: 5,
          }),
        }),
      )
      .default([]),
    { control: "list", label: "Testimonials", itemLabel: "name" },
  ),
  background: sectionBackground,
});

export type Props = z.infer<typeof schema>;
