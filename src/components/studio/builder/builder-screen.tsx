"use client";

import { useCallback, useEffect, useState } from "react";
import { useBuilder } from "@/components/studio/builder/use-builder";
import {
  duplicateSection,
  findSection,
  insertSection,
  insertIntoSlot,
  newSectionId,
  removeSection,
  updateSection,
} from "@/components/studio/builder/builder-utils";
import { CaretDoubleLeft, CaretDoubleRight, StackSimple, SlidersHorizontal } from "@phosphor-icons/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BuilderToolbar from "@/components/studio/builder/builder-toolbar";
import BuilderPalette from "@/components/studio/builder/builder-palette";
import BuilderLayers from "@/components/studio/builder/builder-layers";
import BuilderCanvas, { type Device, type DropTarget } from "@/components/studio/builder/builder-canvas";
import BuilderInspector from "@/components/studio/builder/inspector/builder-inspector";
import type { SectionNode, WidgetManifestEntry } from "@/types";

type Props = { pageId: string };

// Remembers each panel's open/closed state across sessions.
const usePanelState = (key: string) => {
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(key) !== "closed";
  });
  const toggle = useCallback(() => {
    setOpen((value) => {
      const next = !value;
      localStorage.setItem(key, next ? "open" : "closed");
      return next;
    });
  }, [key]);
  return [open, toggle] as const;
};

const BuilderScreen = ({ pageId }: Props) => {
  const builder = useBuilder(pageId);
  const [device, setDevice] = useState<Device>("desktop");
  const [leftOpen, toggleLeft] = usePanelState("pp-builder-left");
  const [rightOpen, toggleRight] = usePanelState("pp-builder-right");

  // Build a fresh section node. List widgets already carry seeded sample content
  // in their manifest defaults (see seedListDefaults), so a drop shows something
  // instead of a blank grid; columns get two empty slots to drop widgets into.
  const buildNode = useCallback(
    (entry: WidgetManifestEntry | { customId: string } | { globalId: string; type: string }): SectionNode => {
      if ("customId" in entry) return { id: newSectionId(), type: `custom:${entry.customId}`, props: {} };
      if ("globalId" in entry) return { id: newSectionId(), type: "global", globalId: entry.globalId, props: {} };
      return {
        id: newSectionId(),
        type: entry.meta.key,
        props: structuredClone(entry.defaults) as Record<string, unknown>,
        ...(entry.meta.key === "columns" ? { children: [[], []] } : {}),
      };
    },
    [],
  );

  const insertWidget = useCallback(
    (entry: WidgetManifestEntry | { customId: string } | { globalId: string; type: string }, index?: number) => {
      const node = buildNode(entry);
      const at = index ?? builder.sections.length;
      builder.setSections((sections) => insertSection(sections, node, at));
      builder.setSelectedId(node.id);
    },
    [builder, buildNode],
  );

  // A palette item dropped on the canvas: resolve its descriptor, build the node,
  // and insert at the drop target — top-level, or inside a container's slot.
  const onDropInsert = useCallback(
    (payload: string, target: DropTarget) => {
      let descriptor: { kind: string; key?: string; id?: string; type?: string };
      try {
        descriptor = JSON.parse(payload);
      } catch {
        return;
      }
      let entry: WidgetManifestEntry | { customId: string } | { globalId: string; type: string } | undefined;
      if (descriptor.kind === "manifest") {
        entry = (builder.manifest?.manifest ?? []).find((item) => item.meta.key === descriptor.key);
      } else if (descriptor.kind === "custom" && descriptor.id) {
        entry = { customId: descriptor.id };
      } else if (descriptor.kind === "global" && descriptor.id && descriptor.type) {
        entry = { globalId: descriptor.id, type: descriptor.type };
      }
      if (!entry) return;
      const node = buildNode(entry);
      if (target.slot) {
        const { sectionId, slotIndex } = target.slot;
        builder.setSections((sections) => insertIntoSlot(sections, sectionId, slotIndex, node, target.index));
      } else {
        builder.setSections((sections) => insertSection(sections, node, target.index));
      }
      builder.setSelectedId(node.id);
    },
    [builder, buildNode],
  );

  // Global keyboard shortcuts: undo/redo and section ops on the selection
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const editing = ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable;
      // Save draft works everywhere, including while typing in an input.
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        builder.saveDraft();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        if (editing) return;
        event.preventDefault();
        if (event.shiftKey) builder.redo();
        else builder.undo();
      }
      if (!editing && builder.selectedId) {
        if (event.key === "Backspace" || event.key === "Delete") {
          event.preventDefault();
          builder.setSections((sections) => removeSection(sections, builder.selectedId!));
          builder.setSelectedId(null);
        }
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "d") {
          event.preventDefault();
          builder.setSections((sections) => duplicateSection(sections, builder.selectedId!));
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [builder]);

  // Warn before a tab close / hard navigation drops unsaved edits. (SPA
  // navigation away is covered by the flush-on-unmount in useBuilder.)
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (builder.saveState === "dirty" || builder.saveState === "offline") {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [builder.saveState]);

  if (builder.pageLoading || !builder.page) {
    return <div className="flex h-full items-center justify-center text-sm text-muted">Loading builder…</div>;
  }

  const selected = builder.selectedId ? findSection(builder.sections, builder.selectedId) : null;
  const manifestByKey = new Map((builder.manifest?.manifest ?? []).map((entry) => [entry.meta.key, entry]));

  // Dispatch for the on-canvas section toolbar (move/duplicate/delete by id).
  const onSectionAction = (id: string, action: "up" | "down" | "duplicate" | "delete") => {
    const idx = builder.sections.findIndex((node) => node.id === id);
    if (idx < 0) return;
    if (action === "up" || action === "down") {
      const to = action === "up" ? idx - 1 : idx + 1;
      if (to < 0 || to >= builder.sections.length) return;
      builder.setSections((sections) => {
        const next = [...sections];
        const [moved] = next.splice(idx, 1);
        next.splice(to, 0, moved);
        return next;
      });
    } else if (action === "duplicate") {
      builder.setSections((sections) => duplicateSection(sections, id));
    } else if (action === "delete") {
      builder.setSections((sections) => removeSection(sections, id));
      if (builder.selectedId === id) builder.setSelectedId(null);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <BuilderToolbar
        page={builder.page}
        saveState={builder.saveState}
        device={device}
        onDeviceChange={setDevice}
        onUndo={builder.undo}
        onRedo={builder.redo}
        canUndo={builder.canUndo}
        canRedo={builder.canRedo}
        onSaveDraft={builder.saveDraft}
        onPublish={builder.publish}
        publishing={builder.publishing}
        blockers={builder.blockers}
        pageId={pageId}
      />
      <div className="flex min-h-0 flex-1">
        {leftOpen ? (
          <Tabs defaultValue="widgets" className="flex w-64 shrink-0 flex-col border-r border-hairline bg-surface">
            <div className="flex h-9 shrink-0 items-center gap-1 border-b border-hairline px-2">
              <TabsList className="h-7 flex-1">
                <TabsTrigger value="widgets" className="flex-1 text-xs">
                  Widgets
                </TabsTrigger>
                <TabsTrigger value="layers" className="flex-1 text-xs">
                  Layers
                </TabsTrigger>
              </TabsList>
              <button
                type="button"
                onClick={toggleLeft}
                aria-label="Collapse panel"
                className="studio-focus rounded p-1 text-muted hover:bg-app hover:text-ink"
              >
                <CaretDoubleLeft size={13} />
              </button>
            </div>
            <TabsContent value="widgets" className="mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden">
              <BuilderPalette manifest={builder.manifest} onInsert={insertWidget} />
            </TabsContent>
            <TabsContent value="layers" className="mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden">
              <BuilderLayers
                sections={builder.sections}
                selectedId={builder.selectedId}
                onSelect={builder.setSelectedId}
                manifestByKey={manifestByKey}
                onReorder={(from, to) =>
                  builder.setSections((sections) => {
                    const next = [...sections];
                    const [moved] = next.splice(from, 1);
                    next.splice(to, 0, moved);
                    return next;
                  })
                }
                onToggleHidden={(id) =>
                  builder.setSections((sections) => updateSection(sections, id, (node) => ({ ...node, hidden: !node.hidden })))
                }
                onDuplicate={(id) => builder.setSections((sections) => duplicateSection(sections, id))}
                onDelete={(id) => {
                  builder.setSections((sections) => removeSection(sections, id));
                  if (builder.selectedId === id) builder.setSelectedId(null);
                }}
                onRename={(id, adminLabel) =>
                  builder.setSections((sections) => updateSection(sections, id, { adminLabel: adminLabel || undefined }))
                }
              />
            </TabsContent>
          </Tabs>
        ) : (
          <button
            type="button"
            onClick={toggleLeft}
            aria-label="Expand widgets panel"
            className="studio-focus flex w-9 shrink-0 flex-col items-center gap-2 border-r border-hairline bg-surface pt-2 text-muted hover:text-ink"
          >
            <CaretDoubleRight size={14} />
            <StackSimple size={15} />
          </button>
        )}
        <BuilderCanvas
          path={builder.page.path}
          device={device}
          selectedId={builder.selectedId}
          onSelect={builder.setSelectedId}
          empty={builder.sections.length === 0}
          reloadKey={builder.canvasKey}
          onDropInsert={onDropInsert}
          onSectionAction={onSectionAction}
        />
        {rightOpen ? (
          <div className="flex shrink-0">
            <button
              type="button"
              onClick={toggleRight}
              aria-label="Collapse inspector panel"
              className="studio-focus flex w-6 shrink-0 items-start justify-center border-l border-hairline bg-surface pt-2 text-muted hover:text-ink"
            >
              <CaretDoubleRight size={13} />
            </button>
            <BuilderInspector
              section={selected}
              entry={selected ? manifestByKey.get(selected.type) : undefined}
              blockers={builder.blockers.filter((blocker) => blocker.sectionId === selected?.id)}
              onChange={(patch) =>
                selected && builder.setSections((sections) => updateSection(sections, selected.id, patch))
              }
              onCommit={builder.saveDraft}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={toggleRight}
            aria-label="Expand inspector panel"
            className="studio-focus flex w-9 shrink-0 flex-col items-center gap-2 border-l border-hairline bg-surface pt-2 text-muted hover:text-ink"
          >
            <CaretDoubleLeft size={14} />
            <SlidersHorizontal size={15} />
          </button>
        )}
      </div>
    </div>
  );
};

export default BuilderScreen;
