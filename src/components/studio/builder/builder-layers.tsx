"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DotsSixVertical, Eye, EyeSlash, Copy, Trash, Globe, Cube } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { SectionNode, WidgetManifestEntry } from "@/types";

type Props = {
  sections: SectionNode[];
  selectedId: string | null;
  manifestByKey: Map<string, WidgetManifestEntry>;
  onSelect: (id: string) => void;
  onReorder: (from: number, to: number) => void;
  onToggleHidden: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, adminLabel: string) => void;
};

const LayerRow = ({
  node,
  label,
  selected,
  onSelect,
  onToggleHidden,
  onDuplicate,
  onDelete,
  onRename,
}: {
  node: SectionNode;
  label: string;
  selected: boolean;
  onSelect: () => void;
  onToggleHidden: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onRename: (label: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: node.id });
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState("");

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group flex items-center gap-1 rounded-lg px-1.5 py-1.5 text-xs",
        selected ? "bg-brand-soft text-brand" : "text-body hover:bg-app",
        isDragging && "opacity-60",
        node.hidden && "opacity-50",
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted opacity-0 group-hover:opacity-100"
        aria-label={`Reorder ${label}`}
      >
        <DotsSixVertical size={13} />
      </button>
      {node.type === "global" ? <Globe size={12} className="shrink-0" /> : <Cube size={12} className="shrink-0" />}
      {renaming ? (
        <input
          autoFocus
          className="w-full rounded border border-hairline bg-surface px-1 py-0.5 text-xs text-ink"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            onRename(draft);
            setRenaming(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onRename(draft);
              setRenaming(false);
            }
            if (e.key === "Escape") setRenaming(false);
          }}
        />
      ) : (
        <button
          type="button"
          onClick={onSelect}
          onDoubleClick={() => {
            setDraft(node.adminLabel ?? "");
            setRenaming(true);
          }}
          className="min-w-0 flex-1 truncate text-left font-medium"
          title="Double-click to rename"
        >
          {label}
        </button>
      )}
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100">
        <button type="button" onClick={onToggleHidden} aria-label={node.hidden ? "Show section" : "Hide section"} className="p-0.5 text-muted hover:text-ink">
          {node.hidden ? <EyeSlash size={12} /> : <Eye size={12} />}
        </button>
        <button type="button" onClick={onDuplicate} aria-label="Duplicate section" className="p-0.5 text-muted hover:text-ink">
          <Copy size={12} />
        </button>
        <button type="button" onClick={onDelete} aria-label="Delete section" className="p-0.5 text-muted hover:text-danger">
          <Trash size={12} />
        </button>
      </div>
    </div>
  );
};

const BuilderLayers = ({
  sections,
  selectedId,
  manifestByKey,
  onSelect,
  onReorder,
  onToggleHidden,
  onDuplicate,
  onDelete,
  onRename,
}: Props) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const labelFor = (node: SectionNode) => {
    const base =
      node.type === "global"
        ? "Global widget"
        : node.type.startsWith("custom:")
          ? "Custom widget"
          : (manifestByKey.get(node.type)?.meta.name ?? node.type);
    return node.adminLabel ? `${base} (${node.adminLabel})` : base;
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = sections.findIndex((node) => node.id === active.id);
    const to = sections.findIndex((node) => node.id === over.id);
    if (from >= 0 && to >= 0) onReorder(from, to);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {sections.length === 0 ? (
          <p className="px-1 py-4 text-center text-xs text-muted">Sections appear here as you add them.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={sections.map((node) => node.id)} strategy={verticalListSortingStrategy}>
              {sections.map((node) => (
                <LayerRow
                  key={node.id}
                  node={node}
                  label={labelFor(node)}
                  selected={selectedId === node.id}
                  onSelect={() => onSelect(node.id)}
                  onToggleHidden={() => onToggleHidden(node.id)}
                  onDuplicate={() => onDuplicate(node.id)}
                  onDelete={() => onDelete(node.id)}
                  onRename={(label) => onRename(node.id, label)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};

export default BuilderLayers;
