import crypto from "node:crypto";
import { z } from "zod";
import { widgetRegistry } from "@/widgets/registry";
import type { WidgetManifestEntry } from "@/types";

// Unwrap ZodDefault/ZodOptional/etc. down to the underlying ZodArray, if any.
const asArray = (fieldSchema: unknown): z.ZodArray | null => {
  let current = fieldSchema;
  for (let i = 0; i < 6 && current; i++) {
    if (current instanceof z.ZodArray) return current;
    current = (current as { _def?: { innerType?: unknown } })._def?.innerType;
  }
  return null;
};

// Insertion defaults leave list fields empty, so a dropped Pricing Table / Team
// Grid / FAQ renders blank. Seed each empty top-level list with sample items
// built from the element schema's own defaults (skipped when the element needs
// data we can't invent, e.g. an image — that stays empty). One place, every widget.
const seedListDefaults = (schema: z.ZodType, defaults: Record<string, unknown>): Record<string, unknown> => {
  const shape = (schema as unknown as { shape?: Record<string, z.ZodType> }).shape;
  if (!shape) return defaults;
  const seeded = { ...defaults };
  for (const [key, fieldSchema] of Object.entries(shape)) {
    if (!Array.isArray(seeded[key]) || (seeded[key] as unknown[]).length > 0) continue;
    const array = asArray(fieldSchema);
    const element = (array?._def as { element?: z.ZodType } | undefined)?.element;
    const sample = element?.safeParse({});
    if (sample?.success) {
      seeded[key] = [0, 1, 2].map(() => structuredClone(sample.data));
    }
  }
  return seeded;
};

// Serializes every widget schema to JSON Schema (Zod 4 native) with the
// ppControl annotations embedded. The Studio builds its inspector forms from
// this manifest and never imports widget components.
export const buildManifest = (): WidgetManifestEntry[] =>
  Object.entries(widgetRegistry).map(([key, { schema, meta }]) => {
    const jsonSchema = z.toJSONSchema(schema, { io: "input", unrepresentable: "any" });
    const schemaHash = crypto
      .createHash("sha256")
      .update(JSON.stringify(jsonSchema))
      .digest("hex")
      .slice(0, 16);

    // Insertion defaults: parse an empty object so every .default() applies,
    // then seed sample items into otherwise-empty lists.
    const parsed = schema.safeParse({});
    const defaults = parsed.success ? seedListDefaults(schema, parsed.data as Record<string, unknown>) : {};

    return { meta: { ...meta, key }, schemaHash, jsonSchema, controls: {}, defaults };
  });
