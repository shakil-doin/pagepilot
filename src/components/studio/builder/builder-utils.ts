import type { SectionNode } from "@/types";

export const newSectionId = () => `sec_${Math.random().toString(36).slice(2, 10)}`;

// All tree operations return new arrays; the builder history relies on it.

export const insertSection = (sections: SectionNode[], node: SectionNode, index: number): SectionNode[] => {
  const next = [...sections];
  next.splice(Math.max(0, Math.min(index, next.length)), 0, node);
  return next;
};

// Insert a node into a container section's column slot (nested drag-drop).
export const insertIntoSlot = (
  sections: SectionNode[],
  sectionId: string,
  slotIndex: number,
  node: SectionNode,
  index: number,
): SectionNode[] =>
  sections.map((section) => {
    if (section.id === sectionId && section.children) {
      return {
        ...section,
        children: section.children.map((slot, i) => (i === slotIndex ? insertSection(slot, node, index) : slot)),
      };
    }
    if (section.children) {
      return { ...section, children: section.children.map((slot) => insertIntoSlot(slot, sectionId, slotIndex, node, index)) };
    }
    return section;
  });

export const removeSection = (sections: SectionNode[], id: string): SectionNode[] =>
  sections
    .filter((node) => node.id !== id)
    .map((node) =>
      node.children ? { ...node, children: node.children.map((slot) => removeSection(slot, id)) } : node,
    );

export const moveSection = (sections: SectionNode[], from: number, to: number): SectionNode[] => {
  const next = [...sections];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

export const findSection = (sections: SectionNode[], id: string): SectionNode | null => {
  for (const node of sections) {
    if (node.id === id) return node;
    for (const slot of node.children ?? []) {
      const found = findSection(slot, id);
      if (found) return found;
    }
  }
  return null;
};

export const updateSection = (
  sections: SectionNode[],
  id: string,
  patch: Partial<SectionNode> | ((node: SectionNode) => SectionNode),
): SectionNode[] =>
  sections.map((node) => {
    if (node.id === id) {
      return typeof patch === "function" ? patch(node) : { ...node, ...patch };
    }
    if (node.children) {
      return { ...node, children: node.children.map((slot) => updateSection(slot, id, patch)) };
    }
    return node;
  });

const cloneWithNewIds = (node: SectionNode): SectionNode => ({
  ...structuredClone(node),
  id: newSectionId(),
  children: node.children?.map((slot) => slot.map(cloneWithNewIds)),
});

export const duplicateSection = (sections: SectionNode[], id: string): SectionNode[] => {
  const index = sections.findIndex((node) => node.id === id);
  if (index >= 0) {
    const copy = cloneWithNewIds(sections[index]);
    copy.adminLabel = sections[index].adminLabel ? `${sections[index].adminLabel} copy` : undefined;
    return insertSection(sections, copy, index + 1);
  }
  return sections.map((node) =>
    node.children ? { ...node, children: node.children.map((slot) => duplicateSection(slot, id)) } : node,
  );
};

// Reads/writes a nested prop value by dot path, tolerating array indexes.
export const getPropAtPath = (props: Record<string, unknown>, path: string): unknown => {
  let cursor: unknown = props;
  for (const key of path.split(".")) {
    if (cursor == null || typeof cursor !== "object") return undefined;
    cursor = (cursor as Record<string, unknown>)[key];
  }
  return cursor;
};

export const setPropAtPath = (
  props: Record<string, unknown>,
  path: string,
  value: unknown,
): Record<string, unknown> => {
  const keys = path.split(".");
  const next = structuredClone(props);
  let cursor: Record<string, unknown> = next;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const current = cursor[key];
    if (current == null || typeof current !== "object") {
      cursor[key] = /^\d+$/.test(keys[i + 1]) ? [] : {};
    }
    cursor = cursor[key] as Record<string, unknown>;
  }
  if (value === undefined) delete cursor[keys[keys.length - 1]];
  else cursor[keys[keys.length - 1]] = value;
  return next;
};
