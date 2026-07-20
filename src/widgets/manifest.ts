import crypto from "node:crypto";
import { z } from "zod";
import { widgetRegistry } from "@/widgets/registry";
import type { WidgetManifestEntry } from "@/types";

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

    // Insertion defaults: parse an empty object so every .default() applies.
    const parsed = schema.safeParse({});
    const defaults = parsed.success ? (parsed.data as Record<string, unknown>) : {};

    return { meta: { ...meta, key }, schemaHash, jsonSchema, controls: {}, defaults };
  });
