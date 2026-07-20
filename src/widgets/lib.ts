import { z } from "zod";
import type { FieldAnnotation, WidgetMeta } from "@/types";

// Attaches editor annotations to a Zod field. Zod 4 metadata flows into
// z.toJSONSchema() output, so one schema drives validation AND the inspector.
export const field = <T extends z.ZodType>(schema: T, annotation: FieldAnnotation): T =>
  schema.meta({ ppControl: annotation }) as T;

export const widgetMeta = (meta: WidgetMeta): WidgetMeta => meta;

// ── Shared value shapes used by inspector controls ───────────────────────────

// "media" control stores a snapshot of the picked asset so rendering costs
// zero queries. Publish re-validates alt against the live Media row.
export const mediaRef = z.object({
  id: z.string(),
  kind: z.enum(["IMAGE", "VIDEO", "FILE"]),
  url: z.string(),
  alt: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  blurDataUrl: z.string().optional(),
  focalX: z.number().optional(),
  focalY: z.number().optional(),
});
export type MediaRef = z.infer<typeof mediaRef>;

// "link" control: internal path, external URL, or #anchor.
export const linkRef = z.object({
  href: z.string(),
  newTab: z.boolean().optional(),
});
export type LinkRef = z.infer<typeof linkRef>;

// Token-aware color: a theme token name ("primary") or a raw value ("#0a0a0a").
export const colorValue = z.string();

export const buttonItem = z.object({
  label: field(z.string().min(1).default("Button"), { control: "text", label: "Label" }),
  link: field(linkRef.default({ href: "#" }), { control: "link", label: "Link" }),
  variant: field(z.enum(["primary", "secondary"]).default("primary"), {
    control: "segmented",
    label: "Style",
  }),
});
export type ButtonItem = z.infer<typeof buttonItem>;

// Background choice shared by most sections; maps to theme tokens.
export const sectionBackground = field(z.enum(["none", "surface", "primary", "secondary"]).default("none"), {
  control: "select",
  label: "Background",
  options: [
    { label: "None", value: "none" },
    { label: "Surface", value: "surface" },
    { label: "Primary", value: "primary" },
    { label: "Secondary", value: "secondary" },
  ],
});
