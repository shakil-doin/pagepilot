import { z } from "zod";
import { field, linkRef, mediaRef } from "@/widgets/lib";

// Shared schema fragments for the trade2sync-derived section widgets.
// Every fragment is a plain Zod shape so a widget can spread it into its own
// z.object() and still get per-field inspector controls.

// Badge + title + description, the intro every t2s section opens with.
export const introShape = {
  badge: field(z.string().optional(), { control: "text", label: "Badge" }),
  title: field(z.string().default("Section title"), { control: "textarea", label: "Title" }),
  description: field(z.string().optional(), { control: "textarea", label: "Description" }),
};

export const alignField = field(z.enum(["center", "left"]).default("center"), {
  control: "segmented",
  label: "Align",
});

// t2s paints sections either on the page background or on the dark brand
// panel; both map onto PagePilot's theme tokens rather than hardcoded navy.
export const toneField = field(z.enum(["light", "surface", "dark", "brand"]).default("light"), {
  control: "select",
  label: "Tone",
  options: [
    { label: "Page", value: "light" },
    { label: "Surface", value: "surface" },
    { label: "Dark panel", value: "dark" },
    { label: "Brand gradient", value: "brand" },
  ],
});

export type Tone = "light" | "surface" | "dark" | "brand";

// Same control, different starting tone — sections that live on the dark slab
// in trade2sync default to "dark" instead of the page background.
export const makeToneField = (initial: Tone) =>
  field(z.enum(["light", "surface", "dark", "brand"]).default(initial), {
    control: "select",
    label: "Tone",
    options: [
      { label: "Page", value: "light" },
      { label: "Surface", value: "surface" },
      { label: "Dark panel", value: "dark" },
      { label: "Brand gradient", value: "brand" },
    ],
  });

export const paddingField = field(z.enum(["none", "sm", "md", "lg"]).default("lg"), {
  control: "segmented",
  label: "Padding",
});

export const roundedField = field(z.boolean().default(false), {
  control: "switch",
  label: "Rounded panel",
});

// ── Repeating item shapes ────────────────────────────────────────────────────

export const checkItem = z.object({
  text: field(z.string().default("Feature"), { control: "text", label: "Text" }),
});

export const statItem = z.object({
  value: field(z.string().default("100+"), { control: "text", label: "Value" }),
  label: field(z.string().default("Label"), { control: "text", label: "Label" }),
  description: field(z.string().optional(), { control: "textarea", label: "Description" }),
});

export const reviewItem = z.object({
  title: field(z.string().default("Great product"), { control: "text", label: "Title" }),
  body: field(z.string().default("What the customer said."), { control: "textarea", label: "Body" }),
  name: field(z.string().default("Customer name"), { control: "text", label: "Name" }),
  rating: field(z.number().min(0).max(5).default(5), { control: "slider", label: "Stars", min: 0, max: 5, step: 0.5 }),
  score: field(z.string().optional(), { control: "text", label: "Score note", placeholder: "5/5" }),
  avatar: field(mediaRef.optional(), { control: "media", label: "Avatar", accept: "image" }),
});

export const logoItem = z.object({
  name: field(z.string().default("Brand"), { control: "text", label: "Name" }),
  logo: field(mediaRef.optional(), { control: "media", label: "Logo", accept: "image" }),
});

export const cardItem = z.object({
  icon: field(z.string().optional(), { control: "icon", label: "Icon" }),
  title: field(z.string().default("Card title"), { control: "text", label: "Title" }),
  description: field(z.string().optional(), { control: "textarea", label: "Description" }),
});

export const linkItem = z.object({
  label: field(z.string().default("Learn more"), { control: "text", label: "Label" }),
  link: field(linkRef.default({ href: "#" }), { control: "link", label: "Link" }),
});

// Rows used by every t2s comparison table variant.
export const compareRow = z.object({
  text: field(z.string().default("Capability"), { control: "text", label: "Text" }),
  tag: field(z.string().optional(), { control: "text", label: "Tag" }),
});

export type CheckItem = z.infer<typeof checkItem>;
export type StatItem = z.infer<typeof statItem>;
export type ReviewItem = z.infer<typeof reviewItem>;
export type LogoItem = z.infer<typeof logoItem>;
export type CardItem = z.infer<typeof cardItem>;
export type LinkItem = z.infer<typeof linkItem>;
export type CompareRow = z.infer<typeof compareRow>;
