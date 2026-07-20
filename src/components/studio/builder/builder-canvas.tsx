"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  // Bumped by the builder after each save; drives a flicker-free reload.
  reloadKey: number;
  onDropInsert?: (payload: string, target: DropTarget) => void;
  onSectionAction?: (id: string, action: SectionAction) => void;
};

const DEVICE_WIDTH: Record<Device, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
};

// Editor chrome injected into the iframe document: hover outline + name badge,
// selection toolbar, and the drop-gap. All INSIDE the iframe so it shares the
// content's coordinate space — controls stay glued through scroll and resize.
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
#pp-ed-gap {
  height: 92px; margin: 8px 12px; border: 2px dashed #4F46E5; border-radius: 10px;
  background: rgba(79,70,229,.09); display: flex; align-items: center; justify-content: center;
  color: #4F46E5; font: 600 12px/1 ui-sans-serif, system-ui; box-sizing: border-box;
}
#pp-ed-gap::after { content: 'Drop here'; }
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

  // The drop-gap is a real in-flow element inserted between sections during a
  // drag, so content physically opens up to receive the widget (Elementor feel).
  const gap = doc.createElement("div");
  gap.id = "pp-ed-gap";

  // Top-level sections only (nested widgets inside columns are also stamped).
  const tops = (): HTMLElement[] =>
    Array.from(doc.querySelectorAll<HTMLElement>("[data-pp-section]")).filter(
      (el) => !el.parentElement?.closest("[data-pp-slot]") && !el.parentElement?.closest("[data-pp-section]"),
    );

  const childSections = (slotEl: HTMLElement): HTMLElement[] =>
    Array.from(slotEl.querySelectorAll<HTMLElement>("[data-pp-section]")).filter(
      (el) => el.parentElement?.closest("[data-pp-slot]") === slotEl,
    );

  let curSel: string | null = handlersRef.current.selectedId;
  let pendingTarget: DropTarget = { index: 0 };
  let gapKey = "";

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
      if (r && (r.top < 0 || r.bottom > win.innerHeight)) el!.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    curSel = id;
    positionToolbar();
  };

  // Resolve a pointer to a drop target plus where to place the gap element.
  const resolveDrop = (
    clientY: number,
    eventTarget: EventTarget | null,
  ): { target: DropTarget; container: HTMLElement; refNode: HTMLElement | null } => {
    const slotEl = ((eventTarget as HTMLElement | null)?.closest?.("[data-pp-slot]") ?? null) as HTMLElement | null;
    const list = slotEl ? childSections(slotEl) : tops();
    const parent = slotEl ?? tops()[0]?.parentElement ?? doc.body;
    const slot = slotEl
      ? (() => {
          const [sectionId, slotIndex] = slotEl.getAttribute("data-pp-slot")!.split(":");
          return { sectionId, slotIndex: Number(slotIndex) };
        })()
      : undefined;

    // Ignore the gap itself when measuring.
    const measured = list.filter((el) => el.id !== "pp-ed-gap");
    for (let i = 0; i < measured.length; i++) {
      const r = measured[i].getBoundingClientRect();
      if (clientY < r.top + r.height / 2) return { target: { slot, index: i }, container: parent as HTMLElement, refNode: measured[i] };
    }
    return { target: { slot, index: measured.length }, container: parent as HTMLElement, refNode: null };
  };

  const showGap = (drop: ReturnType<typeof resolveDrop>) => {
    const key = `${drop.target.slot?.sectionId ?? "root"}:${drop.target.slot?.slotIndex ?? ""}:${drop.target.index}`;
    if (key === gapKey && gap.isConnected) return; // stable — avoid layout thrash
    gapKey = key;
    if (drop.refNode?.parentNode) drop.refNode.parentNode.insertBefore(gap, drop.refNode);
    else drop.container.appendChild(gap);
  };

  const hideGap = () => {
    gap.remove();
    gapKey = "";
  };

  const dragPayload = (): string | undefined => (win.parent as unknown as { __PP_DRAG__?: string }).__PP_DRAG__;
  const isOurDrag = (event: DragEvent) =>
    Boolean(dragPayload()) || (event.dataTransfer?.types.includes(PP_INSERT_MIME) ?? false);

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

  const onDragOver = (event: DragEvent) => {
    if (!isOurDrag(event)) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
    const drop = resolveDrop(event.clientY, event.target);
    pendingTarget = drop.target;
    showGap(drop);
  };

  const onDrop = (event: DragEvent) => {
    if (!isOurDrag(event)) return;
    event.preventDefault();
    hideGap();
    const payload = dragPayload() || event.dataTransfer?.getData(PP_INSERT_MIME);
    if (payload) handlersRef.current.onDropInsert?.(payload, pendingTarget);
  };

  const onDragLeave = (event: DragEvent) => {
    if (!event.relatedTarget) hideGap();
  };
  const onDragEnd = () => hideGap();

  const reposition = () => positionToolbar();

  doc.addEventListener("click", onClick, true);
  toolbar.addEventListener("click", onToolbarClick, true);
  doc.addEventListener("dragover", onDragOver);
  doc.addEventListener("drop", onDrop);
  doc.addEventListener("dragleave", onDragLeave);
  doc.addEventListener("dragend", onDragEnd);
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
      doc.removeEventListener("dragend", onDragEnd);
      win.removeEventListener("scroll", reposition, true);
      win.removeEventListener("resize", reposition);
    },
  };
};

// The canvas is an iframe of the real site renderer in draft mode. Two iframes
// are double-buffered: the next version loads in the hidden twin and is swapped
// in on its load event, so an edit never flashes a blank frame.
const BuilderCanvas = ({ path, device, selectedId, onSelect, empty, reloadKey, onDropInsert, onSectionAction }: Props) => {
  const previewSrc = useCallback((v: number) => `/api/preview?path=${encodeURIComponent(path)}&v=${v}`, [path]);

  const frames = [useRef<HTMLIFrameElement>(null), useRef<HTMLIFrameElement>(null)] as const;
  const editorRef = useRef<EditorController | null>(null);
  const handlersRef = useRef<Handlers>({ selectedId, onSelect, onDropInsert, onSectionAction });
  const lastReloadKey = useRef(reloadKey);
  const pendingLoad = useRef<{ idx: number; key: number } | null>(null);

  const [activeIdx, setActiveIdx] = useState(0);
  const [srcs, setSrcs] = useState<[string, string]>([previewSrc(reloadKey), "about:blank"]);

  useEffect(() => {
    handlersRef.current = { selectedId, onSelect, onDropInsert, onSectionAction };
  });

  // On each save the builder bumps reloadKey: load it into the hidden frame.
  useEffect(() => {
    if (reloadKey === lastReloadKey.current) return;
    lastReloadKey.current = reloadKey;
    const target = 1 - activeIdx;
    pendingLoad.current = { idx: target, key: reloadKey };
    setSrcs((prev) => {
      const next: [string, string] = [...prev];
      next[target] = previewSrc(reloadKey);
      return next;
    });
  }, [reloadKey, activeIdx, previewSrc]);

  const onFrameLoad = (idx: number) => {
    const doc = frames[idx].current?.contentDocument;
    if (!doc || frames[idx].current?.src.endsWith("about:blank")) return;

    if (idx === activeIdx) {
      // First load of the visible frame.
      editorRef.current?.destroy();
      editorRef.current = buildEditor(doc, handlersRef);
      return;
    }
    // A hidden frame finished loading the newest version — swap it in.
    if (pendingLoad.current?.idx !== idx) return;
    const prevWin = frames[activeIdx].current?.contentWindow;
    const scrollY = prevWin?.scrollY ?? 0;
    editorRef.current?.destroy();
    editorRef.current = buildEditor(doc, handlersRef);
    doc.defaultView?.scrollTo(0, scrollY);
    pendingLoad.current = null;
    setActiveIdx(idx);
  };

  useEffect(() => () => editorRef.current?.destroy(), []);

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
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            <div className="rounded-xl border border-dashed border-hairline bg-surface/95 px-8 py-6 text-center">
              <p className="text-sm font-medium text-ink">This page is empty</p>
              <p className="mt-1 text-xs text-muted">Drag a widget from the left onto the canvas, or click one to add it.</p>
            </div>
          </div>
        ) : null}
        {[0, 1].map((idx) => (
          <iframe
            key={idx}
            ref={frames[idx]}
            src={srcs[idx]}
            onLoad={() => onFrameLoad(idx)}
            title="Page preview"
            className={cn(
              "absolute inset-0 h-full w-full transition-opacity duration-150",
              idx === activeIdx ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0",
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default BuilderCanvas;
