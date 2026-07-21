"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import CanvasRender from "@/components/studio/builder/canvas-render";
import { PP_INSERT_MIME } from "@/components/studio/builder/builder-palette";
import type { SectionNode } from "@/types";
// Site base styles for the in-document canvas. Everything is namespaced under
// .pp-site / pp-* so it can't bleed into the studio chrome.
import "@/app/(site)/site.css";

export type Device = "desktop" | "tablet" | "mobile";
export type SectionAction = "up" | "down" | "duplicate" | "delete";

// Where a dragged widget lands: top-level at `index`, or inside a container's
// column slot (`slot`) at `index` within that slot.
export type DropTarget = { slot?: { sectionId: string; slotIndex: number }; index: number };

type Props = {
  sections: SectionNode[];
  device: Device;
  selectedId: string | null;
  onSelect: (id: string) => void;
  empty: boolean;
  themeCss?: string;
  fontClass?: string;
  onDropInsert?: (payload: string, target: DropTarget) => void;
  onSectionAction?: (id: string, action: SectionAction) => void;
};

const DEVICE_WIDTH: Record<Device, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
};

// Editor chrome, scoped to the canvas so it never touches studio UI. Hover
// highlighting is driven by JS (hoverRuleFor) rather than CSS :hover, so only
// the innermost widget under the pointer lights up — nested sections no longer
// stack overlapping outlines and name badges.
const EDITOR_CSS = `
.pp-canvas [data-pp-section] { position: relative; }
.pp-canvas .pp-slot { min-height: 64px; }
.pp-canvas .pp-slot:empty {
  display: flex; align-items: center; justify-content: center;
  min-height: 72px; border: 2px dashed rgba(79,70,229,.45); border-radius: 10px;
  background: rgba(79,70,229,.05); margin: 4px;
}
.pp-canvas .pp-slot:empty::after {
  content: 'Drop a widget here'; color: rgba(79,70,229,.75);
  font: 600 11px/1 ui-sans-serif, system-ui;
}
.pp-canvas .pp-drop-gap {
  height: 92px; margin: 8px 12px; border: 2px dashed #4F46E5; border-radius: 10px;
  background: rgba(79,70,229,.09); display: flex; align-items: center; justify-content: center;
  color: #4F46E5; font: 600 12px/1 ui-sans-serif, system-ui; box-sizing: border-box;
}
`;

const selectRuleFor = (id: string | null) =>
  id ? `.pp-canvas [data-pp-section="${id}"] { outline: 2px solid #4F46E5 !important; outline-offset: -2px; }` : "";

// Outline + name badge for the single innermost hovered widget only.
const hoverRuleFor = (id: string | null) =>
  id
    ? `
.pp-canvas [data-pp-section="${id}"] { outline: 2px dashed rgba(79,70,229,.55); outline-offset: -2px; cursor: pointer; }
.pp-canvas [data-pp-section="${id}"]::before {
  content: attr(data-pp-name); position: absolute; top: 0; left: 0; z-index: 40;
  background: #4F46E5; color: #fff; font: 600 10px/1.6 ui-sans-serif, system-ui;
  padding: 1px 6px; border-radius: 0 0 4px 0; pointer-events: none; text-transform: capitalize;
}`
    : "";

const BuilderCanvas = ({
  sections,
  device,
  selectedId,
  onSelect,
  empty,
  themeCss,
  fontClass,
  onDropInsert,
  onSectionAction,
}: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const pendingTarget = useRef<DropTarget>({ index: 0 });
  const [toolbar, setToolbar] = useState<{ top: number; left: number; first: boolean; last: boolean } | null>(null);
  // Top-level drops open an in-flow gap at this index; slot drops draw a line.
  const [gapIndex, setGapIndex] = useState<number | null>(null);
  const [dropLine, setDropLine] = useState<{ top: number; left: number; width: number } | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const clearDropHints = useCallback(() => {
    setGapIndex(null);
    setDropLine(null);
  }, []);

  // Top-level section elements, in document order (ignoring nested ones).
  const topSections = useCallback((): HTMLElement[] => {
    const frame = frameRef.current;
    if (!frame) return [];
    return Array.from(frame.querySelectorAll<HTMLElement>("[data-pp-section]")).filter(
      (el) => !el.parentElement?.closest("[data-pp-slot]") && !el.parentElement?.closest("[data-pp-section]"),
    );
  }, []);

  // The sibling sections of `el` — its own column slot's direct children, or the
  // top-level list — used to know if move-up/down are available.
  const siblingsOf = useCallback(
    (el: HTMLElement): HTMLElement[] => {
      const slot = el.parentElement?.closest<HTMLElement>("[data-pp-slot]");
      if (!slot) return topSections();
      return Array.from(slot.querySelectorAll<HTMLElement>("[data-pp-section]")).filter(
        (n) => n.parentElement?.closest("[data-pp-slot]") === slot,
      );
    },
    [topSections],
  );

  // Position the floating toolbar over the current selection — top-level OR a
  // widget nested inside a container/column slot.
  const positionToolbar = useCallback(() => {
    const scroll = scrollRef.current;
    const frame = frameRef.current;
    if (!scroll || !frame || !selectedId) return setToolbar(null);
    const el = frame.querySelector<HTMLElement>(`[data-pp-section="${CSS.escape(selectedId)}"]`);
    if (!el) return setToolbar(null);
    const siblings = siblingsOf(el);
    const idx = siblings.indexOf(el);
    const r = el.getBoundingClientRect();
    const c = scroll.getBoundingClientRect();
    setToolbar({
      top: r.top - c.top + scroll.scrollTop - 30,
      left: r.left - c.left + scroll.scrollLeft + 4,
      first: idx <= 0,
      last: idx === siblings.length - 1,
    });
  }, [selectedId, siblingsOf]);

  useLayoutEffect(() => {
    positionToolbar();
  }, [positionToolbar, sections, device]);

  useEffect(() => {
    const scroll = scrollRef.current;
    if (!scroll) return;
    const onScroll = () => positionToolbar();
    scroll.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      scroll.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [positionToolbar]);

  const onClick = (event: React.MouseEvent) => {
    const el = (event.target as HTMLElement).closest("[data-pp-section]");
    if (!el) return;
    event.preventDefault();
    onSelect(el.getAttribute("data-pp-section")!);
  };

  // Highlight only the innermost widget under the pointer.
  const onMouseOver = (event: React.MouseEvent) => {
    const id = (event.target as HTMLElement).closest("[data-pp-section]")?.getAttribute("data-pp-section") ?? null;
    setHoverId((prev) => (prev === id ? prev : id));
  };

  const dragPayload = (): string | undefined => (window as unknown as { __PP_DRAG__?: string }).__PP_DRAG__;
  const isOurDrag = (event: React.DragEvent) =>
    Boolean(dragPayload()) || event.dataTransfer.types.includes(PP_INSERT_MIME);

  // Resolve a pointer to a drop target and where to draw the insertion line.
  const resolveDrop = (clientY: number, target: EventTarget | null) => {
    const frame = frameRef.current!;
    const scroll = scrollRef.current!;
    const slotEl = (target as HTMLElement | null)?.closest?.("[data-pp-slot]") as HTMLElement | null;
    const list = slotEl
      ? Array.from(slotEl.querySelectorAll<HTMLElement>("[data-pp-section]")).filter(
          (el) => el.parentElement?.closest("[data-pp-slot]") === slotEl,
        )
      : topSections();
    const slot = slotEl
      ? (() => {
          const [sectionId, slotIndex] = slotEl.getAttribute("data-pp-slot")!.split(":");
          return { sectionId, slotIndex: Number(slotIndex) };
        })()
      : undefined;
    const container = (slotEl ?? frame).getBoundingClientRect();
    const c = scroll.getBoundingClientRect();

    for (let i = 0; i < list.length; i++) {
      const r = list[i].getBoundingClientRect();
      if (clientY < r.top + r.height / 2) {
        pendingTarget.current = { slot, index: i };
        return { top: r.top - c.top + scroll.scrollTop, left: container.left - c.left + scroll.scrollLeft, width: container.width };
      }
    }
    pendingTarget.current = { slot, index: list.length };
    const lastR = list[list.length - 1]?.getBoundingClientRect();
    const top = lastR ? lastR.bottom - c.top + scroll.scrollTop : container.top - c.top + scroll.scrollTop;
    return { top, left: container.left - c.left + scroll.scrollLeft, width: container.width };
  };

  const onDragOver = (event: React.DragEvent) => {
    if (!isOurDrag(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    const line = resolveDrop(event.clientY, event.target); // sets pendingTarget.current
    // Inside a column slot → a line; at the top level → open a real gap so the
    // page parts to receive the widget.
    if (pendingTarget.current.slot) {
      setGapIndex(null);
      setDropLine(line);
    } else {
      setDropLine(null);
      setGapIndex(pendingTarget.current.index);
    }
  };

  const onDrop = (event: React.DragEvent) => {
    if (!isOurDrag(event)) return;
    event.preventDefault();
    clearDropHints();
    const payload = dragPayload() || event.dataTransfer.getData(PP_INSERT_MIME);
    if (payload) onDropInsert?.(payload, pendingTarget.current);
  };

  const onDragLeave = (event: React.DragEvent) => {
    if (!event.relatedTarget || !scrollRef.current?.contains(event.relatedTarget as Node)) clearDropHints();
  };

  return (
    <div className="flex min-w-0 flex-1 items-stretch justify-center bg-app p-4">
      <style>{EDITOR_CSS}</style>
      {themeCss ? <style>{themeCss}</style> : null}
      <style>{selectRuleFor(selectedId)}</style>
      <style>{hoverRuleFor(hoverId)}</style>
      <div
        ref={scrollRef}
        className="relative mx-auto h-full min-h-[500px] w-full overflow-auto rounded-xl border border-hairline bg-white shadow-sm"
        style={{ maxWidth: DEVICE_WIDTH[device] === "100%" ? "100%" : DEVICE_WIDTH[device] }}
        onClick={onClick}
        onMouseOver={onMouseOver}
        onMouseLeave={() => setHoverId(null)}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragLeave={onDragLeave}
      >
        {empty ? (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            <div className="rounded-xl border border-dashed border-hairline bg-surface/95 px-8 py-6 text-center">
              <p className="text-sm font-medium text-ink">This page is empty</p>
              <p className="mt-1 text-xs text-muted">Drag a widget from the left onto the canvas, or click one to add it.</p>
            </div>
          </div>
        ) : null}

        <div ref={frameRef} className={cn("pp-site pp-canvas min-h-full", fontClass)}>
          <CanvasRender sections={sections} gapIndex={gapIndex} />
        </div>

        {dropLine ? (
          <div
            className="pointer-events-none absolute z-40 h-0.5 rounded-full bg-brand"
            style={{ top: dropLine.top, left: dropLine.left, width: dropLine.width }}
          />
        ) : null}

        {toolbar ? (
          <div
            className="absolute z-40 flex gap-0.5 rounded-md bg-brand p-0.5 shadow-lg"
            style={{ top: Math.max(toolbar.top, 2), left: toolbar.left }}
          >
            {(
              [
                { a: "up", label: "↑", title: "Move up", disabled: toolbar.first },
                { a: "down", label: "↓", title: "Move down", disabled: toolbar.last },
                { a: "duplicate", label: "⧉", title: "Duplicate", disabled: false },
                { a: "delete", label: "✕", title: "Delete", disabled: false },
              ] as const
            ).map((b) => (
              <button
                key={b.a}
                type="button"
                title={b.title}
                disabled={b.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectedId) onSectionAction?.(selectedId, b.a);
                }}
                className="flex h-[22px] w-[22px] items-center justify-center rounded text-[13px] font-semibold text-white hover:bg-white/20 disabled:opacity-40"
              >
                {b.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default BuilderCanvas;
