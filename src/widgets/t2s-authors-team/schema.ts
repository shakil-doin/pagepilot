import { z } from "zod";
import { field, widgetMeta, mediaRef, linkRef } from "@/widgets/lib";
import { introShape, toneField } from "@/widgets/t2s-lib";

export const meta = widgetMeta({
  key: "t2s-authors-team",
  name: "Author Cards",
  category: "Content",
  description: "Profile cards with avatar, bio, expertise chips and social links",
});

export const schema = z.object({
  ...introShape,
  rule: field(z.boolean().default(true), { control: "switch", label: "Accent rule" }),
  columns: field(z.number().int().min(1).max(3).default(2), {
    control: "segmented",
    label: "Columns",
    options: [
      { label: "1", value: 1 },
      { label: "2", value: 2 },
      { label: "3", value: 3 },
    ],
  }),
  members: field(
    z
      .array(
        z.object({
          name: field(z.string().default("Team member"), { control: "text", label: "Name" }),
          role: field(z.string().optional(), { control: "text", label: "Role" }),
          avatar: field(mediaRef.optional(), { control: "media", label: "Avatar", accept: "image" }),
          bio: field(z.string().optional(), { control: "textarea", label: "Bio" }),
          expertiseTitle: field(z.string().optional(), { control: "text", label: "Expertise heading" }),
          expertise: field(
            z
              .array(z.object({ text: field(z.string().default("Skill"), { control: "text", label: "Skill" }) }))
              .default([]),
            { control: "list", label: "Expertise chips", itemLabel: "text" },
          ),
          socials: field(
            z
              .array(
                z.object({
                  icon: field(z.string().optional(), { control: "icon", label: "Icon" }),
                  label: field(z.string().default("Profile"), { control: "text", label: "Label" }),
                  link: field(linkRef.default({ href: "#" }), { control: "link", label: "Link" }),
                }),
              )
              .default([]),
            { control: "list", label: "Social links", itemLabel: "label" },
          ),
        }),
      )
      .default([]),
    { control: "list", label: "Members", itemLabel: "name" },
  ),
  tone: toneField,
});

export type Props = z.infer<typeof schema>;
