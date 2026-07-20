"use client";

import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { PP_INSERT_MIME } from "@/components/studio/builder/builder-palette";

export type Device = "desktop" | "tablet" | "mobile";

export type SectionAction = "up" | "down" | "duplicate" | "delete";

// Where a dragged widget lands: top-level at `index`, or inside a container's
// column slot (`slot`) at `index` within that slot.
export type DropTarget = { slot?: { sectionId: string; slotIndex: number }; index: number };

type Props = {
  path: string;
  device: Device;
  selectedId: string | null;
  onSelect: (id: string) => void;
  empty: boolean;
  onDropInsert?: (payload: string, target: DropTarget) => void;
  onSectionAction?: (id: string, action: SectionAction) => void;
};

const DEVICE_WIDTH: Record<Device, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
};

// Base editor chrome injected into the iframe document: hover outline + name
// badge on every section, plus styles for the toolbar and drop indicator that
// the controller below positions. All of this lives INSIDE the iframe so it
// shares the content's coordinate space — no parent→iframe coordinate math,
// so controls stay glued to their section through scroll and resize.
const EDITOR_CSS = `
[data-pp-section] { position: relative; }
[data-pp-section]:hover { outline: 2px dashed rgba(79,70,229,.55); outline-offset: -2px; cursor: pointer; }
[data-pp-section]:hover::before {
  content: attr(data-pp-name);
  position: absolute; top: 0; left: 0; z-index: 2147483000;
  background: #4F46E5; color: #fff; font: 600 10px/1.6 ui-sans-serif, system-ui;
  padding: 1px 6px; border-radius: 0 0 4px 0; pointer-events: none;
}
#pp-ed-toolbar {
  display: none; position: fixed; z-index: 2147483600; gap: 2px; padding: 2px;
  background: #4F46E5; border-radius: 6px; box-shadow: 0 4px 14px rgba(0,0,0,.25);
}
#pp-ed-toolbar.on { display: flex; }
#pp-ed-toolbar button {
  all: unset; cursor: pointer; color: #fff; width: 22px; height: 22px;
  display: flex; align-items: center; justify-content: center; border-radius: 4px;
  font: 600 13px/1 ui-sans-serif, system-ui;
}
#pp-ed-toolbar button:hover { background: rgba(255,255,255,.22); }
#pp-ed-toolbar button[disabled] { opacity: .4; cursor: default; }
#pp-ed-drop {
  display: none; position: fixed; z-index: 2147483500; height: 5px;
  background: #4F46E5; border-radius: 3px; box-shadow: 0 0 0 4px rgba(79,70,229,.22);
  pointer-events: none;
}
#pp-ed-drop.on { display: block; }
#pp-ed-drop::before {
  content: ''; position: absolute; left: -4px; top: -3px; width: 11px; height: 11px;
  border-radius: 50%; background: #4F46E5;
}
.pp-slot { min-height: 52px; }
.pp-slot:empty {
  display: flex; align-items: center; justify-content: center;
  border: 1px dashed rgba(79,70,229,.5); border-radius: 8px; margin: 4px 0;
}
.pp-slot:empty::after {
  content: 'Drop widget here'; color: rgba(79,70,229,.7);
  font: 500 11px/1 ui-sans-serif, system-ui;
}
`;

// CSS that outlines the selected section by id — never touches its className,
// which would race the iframe's own React hydration and mismatch.
const selectRuleFor = (id: string | null) =>
  id ? `[data-pp-section="${id}"] { outline: 2px solid #4F46E5 !important; outline-offset: -2px; }` : "";

type Handlers = {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDropInsert?: (payload: string, target: DropTarget) => void;
  onSectionAction?: (id: string, action: SectionAction) => void;
};

// Imperative controller that lives against one iframe document. Rebuilt on every
// iframe load; the parent talks to it through editorRef.
type EditorController = {
  selectExternal: (id: string | null) => void;
  destroy: () => void;
};

const buildEditor = (doc: Document, handlersRef: { current: Handlers }): EditorController => {
  const win = doc.defaultView!;

  const baseStyle = doc.createElement("style");
  baseStyle.textContent = EDITOR_CSS;
  doc.head.appendChild(baseStyle);

  const selStyle = doc.createElement("style");
  selStyle.textContent = selectRuleFor(handlersRef.current.selectedId);
  doc.head.appendChild(selStyle);

  const toolbar = doc.createElement("div");
  toolbar.id = "pp-ed-toolbar";
  toolbar.innerHTML =
    `<button data-a="up" title="Move up">↑</button>` +
    `<button data-a="down" title="Move down">↓</button>` +
    `<button data-a="duplicate" title="Duplicate">⧉</button>` +
    `<button data-a="delete" title="Delete">✕</button>`;
  doc.body.appendChild(toolbar);

  const dropBar = doc.createElement("div");
  dropBar.id = "pp-ed-drop";
  doc.body.appendChild(dropBar);

  // Top-level sections only (nested widgets inside columns are also stamped, but
  // the sections array the parent edits is the top level).
  const tops = (): HTMLElement[] =>
    Array.from(doc.querySelectorAll<HTMLElement>("[data-pp-section]")).filter(
      (el) => !el.parentElement?.closest("[data-pp-section]"),
    );

  let curSel: string | null = handlersRef.current.selectedId;
  let pendingTarget: DropTarget = { index: 0 };

  const positionToolbar = () => {
    if (!curSel) return toolbar.classList.remove("on");
    const list = tops();
    const el = list.find((s) => s.getAttribute("data-pp-section") === curSel);
    if (!el) return toolbar.classList.remove("on");
    const r = el.getBoundingClientRect();
    const idx = list.indexOf(el);
    toolbar.style.top = `${r.top > 30 ? r.top - 26 : r.top + 4}px`;
    toolbar.style.left = `${Math.max(r.left + 4, 4)}px`;
    (toolbar.querySelector('[data-a="up"]') as HTMLButtonElement).disabled = idx === 0;
    (toolbar.querySelector('[data-a="down"]') as HTMLButtonElement).disabled = idx === list.length - 1;
    toolbar.classList.add("on");
  };

  const setSelected = (id: string | null, scroll: boolean) => {
    selStyle.textContent = selectRuleFor(id);
    if (scroll && id && id !== curSel) {
      const el = tops().find((s) => s.getAttribute("data-pp-section") === id);
      const r = el?.getBoundingClientRect();
      if (r && (r.top < 0 || r.bottom > win.innerHeight)) {
        el!.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
    curSel = id;
    positionToolbar();
  };

  // Direct section children of a container element (a slot or the document).
  const childSections = (container: ParentNode): HTMLElement[] =>
    Array.from(container.querySelectorAll<HTMLElement>("[data-pp-section]")).filter((el) => {
      const parentSlot = el.parentElement?.closest("[data-pp-slot]");
      return container instanceof Element && container.hasAttribute("data-pp-slot")
        ? parentSlot === container
        : !parentSlot && !el.parentElement?.closest("[data-pp-section]");
    });

  // Insertion geometry (indicator bar) + the drop target for a pointer position.
  // If the pointer is over a container's column slot, the target is inside it.
  const boundaryFor = (
    clientY: number,
    eventTarget: EventTarget | null,
  ): { y: number; left: number; width: number; target: DropTarget } => {
    const slotEl = (eventTarget as HTMLElement | null)?.closest?.("[data-pp-slot]") ?? null;
    const container: ParentNode = slotEl ?? doc;
    const list = childSections(container);
    const slot = slotEl
      ? (() => {
          const [sectionId, slotIndex] = slotEl.getAttribute("data-pp-slot")!.split(":");
          return { sectionId, slotIndex: Number(slotIndex) };
        })()
      : undefined;

    if (list.length === 0) {
      const r = slotEl ? slotEl.getBoundingClientRect() : { top: 12, left: 12, width: win.innerWidth - 24 };
      return { y: r.top + 2, left: r.left, width: r.width, target: { slot, index: 0 } };
    }
    for (let i = 0; i < list.length; i++) {
      const r = list[i].getBoundingClientRect();
      if (clientY < r.top + r.height / 2) return { y: r.top, left: r.left, width: r.width, target: { slot, index: i } };
    }
    const last = list[list.length - 1].getBoundingClientRect();
    return { y: last.bottom, left: last.left, width: last.width, target: { slot, index: list.length } };
  };

  const dragPayload = (): string | undefined =>
    (win.parent as unknown as { __PP_DRAG__?: string }).__PP_DRAG__;

  // --- listeners ---
  const onClick = (event: MouseEvent) => {
    const el = (event.target as HTMLElement).closest("[data-pp-section]");
    if (!el) return;
    event.preventDefault();
    event.stopPropagation();
    const id = el.getAttribute("data-pp-section")!;
    setSelected(id, false);
    handlersRef.current.onSelect(id);
  };

  const onToolbarClick = (event: MouseEvent) => {
    const btn = (event.target as HTMLElement).closest("button");
    if (!btn || !curSel) return;
    event.preventDefault();
    event.stopPropagation();
    handlersRef.current.onSectionAction?.(curSel, btn.getAttribute("data-a") as SectionAction);
  };

  const isOurDrag = (event: DragEvent) =>
    Boolean(dragPayload()) || (event.dataTransfer?.types.includes(PP_INSERT_MIME) ?? false);

  const onDragOver = (event: DragEvent) => {
    if (!isOurDrag(event)) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
    const b = boundaryFor(event.clientY, event.target);
    pendingTarget = b.target;
    dropBar.style.top = `${b.y - 2}px`;
    dropBar.style.left = `${b.left}px`;
    dropBar.style.width = `${b.width}px`;
    dropBar.classList.add("on");
  };

  const hideDrop = () => dropBar.classList.remove("on");

  const onDrop = (event: DragEvent) => {
    if (!isOurDrag(event)) return;
    event.preventDefault();
    hideDrop();
    const payload = dragPayload() || event.dataTransfer?.getData(PP_INSERT_MIME);
    if (payload) handlersRef.current.onDropInsert?.(payload, pendingTarget);
  };

  const onDragLeave = (event: DragEvent) => {
    // Only when the pointer actually leaves the document, not on child crossings.
    if (!event.relatedTarget) hideDrop();
  };

  const reposition = () => positionToolbar();

  doc.addEventListener("click", onClick, true);
  toolbar.addEventListener("click", onToolbarClick, true);
  doc.addEventListener("dragover", onDragOver);
  doc.addEventListener("drop", onDrop);
  doc.addEventListener("dragleave", onDragLeave);
  win.addEventListener("scroll", reposition, true);
  win.addEventListener("resize", reposition);

  positionToolbar();

  return {
    selectExternal: (id) => setSelected(id, true),
    destroy: () => {
      doc.removeEventListener("click", onClick, true);
      doc.removeEventListener("dragover", onDragOver);
      doc.removeEventListener("drop", onDrop);
      doc.removeEventListener("dragleave", onDragLeave);
      win.removeEventListener("scroll", reposition, true);
      win.removeEventListener("resize", reposition);
    },
  };
};

// The canvas is an iframe of the real site renderer in draft mode: what you see
// is exactly what ships. /api/preview enables the draftMode cookie then
// redirects to the page path.
const BuilderCanvas = ({ path, device, selectedId, onSelect, empty, onDropInsert, onSectionAction }: Props) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const editorRef = useRef<EditorController | null>(null);
  // Injected listeners must always see the latest props without being rebuilt.
  const handlersRef = useRef<Handlers>({ selectedId, onSelect, onDropInsert, onSectionAction });
  useEffect(() => {
    handlersRef.current = { selectedId, onSelect, onDropInsert, onSectionAction };
  });

  const wireIframe = useCallback(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    editorRef.current?.destroy();
    editorRef.current = buildEditor(doc, handlersRef);
  }, []);

  useEffect(() => () => editorRef.current?.destroy(), []);

  // Selection driven from outside the canvas (a layer click) — reflect it into
  // the iframe's editor, which repositions the toolbar and scrolls if needed.
  useEffect(() => {
    editorRef.current?.selectExternal(selectedId);
  }, [selectedId]);

  return (
    <div className="flex min-w-0 flex-1 items-stretch justify-center overflow-auto bg-app p-4">
      <div
        className={cn(
          "relative mx-auto h-full min-h-[500px] overflow-hidden rounded-xl border border-hairline bg-white shadow-sm transition-all",
        )}
        style={{ width: DEVICE_WIDTH[device], maxWidth: "100%" }}
      >
        {empty ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <div className="rounded-xl border border-dashed border-hairline bg-surface/95 px-8 py-6 text-center">
              <p className="text-sm font-medium text-ink">This page is empty</p>
              <p className="mt-1 text-xs text-muted">Drag a widget from the left onto the canvas, or click one to add it.</p>
            </div>
          </div>
        ) : null}
        <iframe
          ref={iframeRef}
          src={`/api/preview?path=${encodeURIComponent(path)}`}
          onLoad={wireIframe}
          className="h-full w-full"
          title="Page preview"
        />
      </div>
    </div>
  );
};

export default BuilderCanvas;
