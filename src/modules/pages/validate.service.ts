import "server-only";
import { widgetRegistry } from "@/widgets/registry";
import type { PublishBlocker, SectionNode } from "@/types";

type ValidateMode = "save" | "publish";

// Walks a section tree and validates every widget instance against its schema.
// Save mode tolerates missing required fields the editor is still filling in
// (they fail closed at render). Publish mode is strict and also enforces alt
// text on every visible image, per the media guardrail.
export const validateSections = (sections: SectionNode[], mode: ValidateMode): PublishBlocker[] => {
  const blockers: PublishBlocker[] = [];

  const checkAltText = (sectionId: string, value: unknown, path: string) => {
    if (Array.isArray(value)) {
      value.forEach((item, i) => checkAltText(sectionId, item, `${path}[${i}]`));
      return;
    }
    if (!value || typeof value !== "object") return;
    const obj = value as Record<string, unknown>;
    if (obj.kind === "IMAGE" && typeof obj.url === "string" && obj.id) {
      if (!obj.alt || String(obj.alt).trim() === "") {
        blockers.push({ sectionId, message: `Image at ${path} is missing alt text` });
      }
      return;
    }
    for (const [key, child] of Object.entries(obj)) checkAltText(sectionId, child, `${path}.${key}`);
  };

  const walk = (nodes: SectionNode[]) => {
    for (const node of nodes) {
      if (node.hidden) continue;

      if (node.type === "global") {
        if (!node.globalId) blockers.push({ sectionId: node.id, message: "Global widget reference is empty" });
        continue;
      }
      if (node.type.startsWith("custom:")) continue; // validated when the custom widget is saved

      const widget = widgetRegistry[node.type];
      if (!widget) {
        blockers.push({ sectionId: node.id, message: `Unknown widget type "${node.type}"` });
        continue;
      }

      if (mode === "publish") {
        const parsed = widget.schema.safeParse(node.props ?? {});
        if (!parsed.success) {
          for (const issue of parsed.error.issues.slice(0, 3)) {
            blockers.push({ sectionId: node.id, message: `${widget.meta.name}: ${issue.path.join(".")} ${issue.message}` });
          }
        }
        // The image widget's media is optional at edit time (so it doesn't error
        // while unset); enforce it here so an empty image can't be published.
        if (node.type === "image") {
          const media = (node.props as Record<string, unknown> | undefined)?.media as { url?: string } | undefined;
          if (!media?.url) blockers.push({ sectionId: node.id, message: `${widget.meta.name}: pick an image before publishing` });
        }
        checkAltText(node.id, node.props, widget.meta.key);
      }

      for (const slot of node.children ?? []) walk(slot);
    }
  };

  walk(sections);
  return blockers;
};
