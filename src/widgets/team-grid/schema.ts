import { z } from "zod";
import { field, widgetMeta, mediaRef, sectionBackground } from "@/widgets/lib";

export const meta = widgetMeta({
  key: "team-grid",
  name: "Team Grid",
  category: "Content",
  description: "Grid of team members with photos, roles, and bios",
});

export const schema = z.object({
  title: field(z.string().optional(), { control: "text", label: "Title" }),
  members: field(
    z
      .array(
        z.object({
          name: field(z.string().min(1).default("Jane Doe"), { control: "text", label: "Name" }),
          role: field(z.string().optional(), { control: "text", label: "Role" }),
          photo: field(mediaRef.optional(), { control: "media", label: "Photo", accept: "image" }),
          bio: field(z.string().optional(), { control: "textarea", label: "Bio" }),
        }),
      )
      .default([]),
    { control: "list", label: "Members", itemLabel: "name" },
  ),
  columns: field(z.number().int().min(2).max(4).default(3), {
    control: "segmented",
    label: "Columns (desktop)",
    options: [
      { label: "2", value: 2 },
      { label: "3", value: 3 },
      { label: "4", value: 4 },
    ],
    responsive: true,
  }),
  background: sectionBackground,
});

export type Props = z.infer<typeof schema>;
