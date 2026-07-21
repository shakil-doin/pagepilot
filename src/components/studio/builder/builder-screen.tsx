"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBuilder } from "@/components/studio/builder/use-builder";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  duplicateSection,
  findSection,
  insertSection,
  insertIntoSlot,
  moveNodeInParent,
  newSectionId,
  removeSection,
  updateSection,
  syncColumnSlots,
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
  const router = useRouter();
  const [device, setDevice] = useState<Device>("desktop");
  const [leftOpen, toggleLeft] = usePanelState("pp-builder-left");
  const [rightOpen, toggleRight] = usePanelState("pp-builder-right");
  // Unsaved-changes guard when leaving the builder (the "back" button).
  const [leaveOpen, setLeaveOpen] = useState(false);

  const requestLeave = useCallback(() => {
    if (builder.dirty) setLeaveOpen(true);
    else router.push("/studio/pages");
  }, [builder.dirty, router]);

  const leaveAfterSave = useCallback(async () => {
    const ok = await builder.saveDraft();
    setLeaveOpen(false);
    if (ok) router.push("/studio/pages");
  }, [builder, router]);

  const leaveDiscard = useCallback(() => {
    setLeaveOpen(false);
    router.push("/studio/pages");
  }, [router]);

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
        // Container widgets start with empty drop slots: columns → 2, container → 1.
        ...(entry.meta.key === "columns"
          ? { children: [[], []] }
          : entry.meta.key === "container"
            ? { children: [[]] }
            : {}),
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

  // Warn before a tab close / reload drops unsaved edits (browser-native
  // prompt). In-app leaving is caught by the back-button guard dialog.
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (builder.dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [builder.dirty]);

  if (builder.pageLoading || !builder.page) {
    return <div className="flex h-full items-center justify-center text-sm text-muted">Loading builder…</div>;
  }

  const selected = builder.selectedId ? findSection(builder.sections, builder.selectedId) : null;
  const manifestByKey = new Map((builder.manifest?.manifest ?? []).map((entry) => [entry.meta.key, entry]));

  // Dispatch for the on-canvas section toolbar (move/duplicate/delete by id).
  // Works for top-level sections and widgets nested inside container/column slots.
  const onSectionAction = (id: string, action: "up" | "down" | "duplicate" | "delete") => {
    if (action === "up") {
      builder.setSections((sections) => moveNodeInParent(sections, id, -1));
    } else if (action === "down") {
      builder.setSections((sections) => moveNodeInParent(sections, id, 1));
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
        onBack={requestLeave}
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
          sections={builder.sections}
          device={device}
          selectedId={builder.selectedId}
          onSelect={builder.setSelectedId}
          empty={builder.sections.length === 0}
          themeCss={builder.themeCss}
          fontClass={builder.fontClass}
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
                selected &&
                builder.setSections((sections) =>
                  updateSection(sections, selected.id, (node) =>
                    // Keep Columns' drop slots in step with its column count.
                    syncColumnSlots(typeof patch === "function" ? patch(node) : { ...node, ...patch }),
                  ),
                )
              }
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

      <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Unsaved changes</DialogTitle>
            <DialogDescription>
              You have edits that haven’t been saved. Save them as a draft before leaving, or discard them.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-between">
            <Button variant="ghost" onClick={leaveDiscard}>
              Discard &amp; leave
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setLeaveOpen(false)}>
                Cancel
              </Button>
              <Button onClick={leaveAfterSave} disabled={builder.saveState === "saving"}>
                {builder.saveState === "saving" ? "Saving…" : "Save draft & leave"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BuilderScreen;
