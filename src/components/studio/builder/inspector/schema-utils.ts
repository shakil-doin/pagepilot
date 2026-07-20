import type { FieldAnnotation } from "@/types";

// A property node of the JSON Schema emitted by zod-to-json-schema (Zod 4
// native). ppControl carries the editor annotation set by field().
export type SchemaNode = {
  type?: string | string[];
  properties?: Record<string, SchemaNode>;
  required?: string[];
  items?: SchemaNode;
  enum?: (string | number)[];
  default?: unknown;
  minimum?: number;
  maximum?: number;
  anyOf?: SchemaNode[];
  ppControl?: FieldAnnotation;
};

// Optional fields serialize as anyOf [T, null] or lose annotations one level
// deep; normalize to the meaningful branch.
export const resolveNode = (node: SchemaNode): SchemaNode => {
  if (node.anyOf && node.anyOf.length > 0) {
    const real = node.anyOf.find((branch) => branch.type !== "null") ?? node.anyOf[0];
    return { ...real, ppControl: node.ppControl ?? real.ppControl, default: node.default ?? real.default };
  }
  return node;
};

export const annotationOf = (node: SchemaNode): FieldAnnotation => {
  const resolved = resolveNode(node);
  if (resolved.ppControl) return resolved.ppControl;
  // Sensible fallbacks so un-annotated schemas still get a usable form
  if (resolved.enum) return { control: "select" };
  const type = Array.isArray(resolved.type) ? resolved.type[0] : resolved.type;
  if (type === "boolean") return { control: "switch" };
  if (type === "number" || type === "integer") return { control: "number" };
  if (type === "array") return { control: "list" };
  if (type === "object") return { control: "group" };
  return { control: "text" };
};

export const optionsOf = (node: SchemaNode): { label: string; value: string | number }[] => {
  const resolved = resolveNode(node);
  const annotation = annotationOf(node);
  if (annotation.options) return annotation.options;
  return (resolved.enum ?? []).map((value) => ({
    label: String(value).replace(/[-_]/g, " ").replace(/^\w/, (c) => c.toUpperCase()),
    value,
  }));
};

export const labelFor = (key: string, node: SchemaNode): string =>
  annotationOf(node).label ?? key.replace(/([A-Z])/g, " $1").replace(/^\w/, (c) => c.toUpperCase());

// Builds a sensible empty value for a new list item from its item schema.
export const emptyValueFor = (node: SchemaNode): unknown => {
  const resolved = resolveNode(node);
  if (resolved.default !== undefined) return structuredClone(resolved.default);
  const type = Array.isArray(resolved.type) ? resolved.type[0] : resolved.type;
  if (type === "object" && resolved.properties) {
    const obj: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(resolved.properties)) {
      const childResolved = resolveNode(child);
      if (childResolved.default !== undefined) obj[key] = structuredClone(childResolved.default);
      else if ((resolved.required ?? []).includes(key)) obj[key] = emptyValueFor(child);
    }
    return obj;
  }
  if (type === "array") return [];
  if (type === "boolean") return false;
  if (type === "number" || type === "integer") return resolved.minimum ?? 0;
  if (resolved.enum) return resolved.enum[0];
  return "";
};
