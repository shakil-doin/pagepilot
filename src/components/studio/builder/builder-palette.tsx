"use client";

import { useMemo, useState, type DragEvent } from "react";
import { MagnifyingGlass, Plus } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ManifestData } from "@/components/studio/builder/use-builder";
import type { WidgetManifestEntry } from "@/types";

type InsertDescriptor =
  | { kind: "manifest"; key: string }
  | { kind: "custom"; id: string }
  | { kind: "global"; id: string; type: string };

type Props = {
  manifest: ManifestData | undefined;
  onInsert: (
    entry: WidgetManifestEntry | { customId: string } | { globalId: string; type: string },
    index?: number,
  ) => void;
  onDragStateChange?: (dragging: boolean) => void;
};

export const PP_INSERT_MIME = "application/pp-insert";

const CATEGORY_ORDER = ["Basic", "Layout", "Content", "Marketing"] as const;

const BuilderPalette = ({ manifest, onInsert, onDragStateChange }: Props) => {
  const [query, setQuery] = useState("");

  // A draggable palette item carries an insert descriptor; the canvas overlay
  // reads it on drop and inserts at the pointer position.
  const dragProps = (descriptor: InsertDescriptor) => ({
    draggable: true,
    onDragStart: (event: DragEvent) => {
      const payload = JSON.stringify(descriptor);
      event.dataTransfer.setData(PP_INSERT_MIME, payload);
      event.dataTransfer.effectAllowed = "copy";
      // Also stash on a window global: reading dataTransfer values cross-frame
      // (parent palette → iframe canvas) is unreliable, so the iframe reads this.
      (window as unknown as { __PP_DRAG__?: string }).__PP_DRAG__ = payload;
      onDragStateChange?.(true);
    },
    onDragEnd: () => {
      (window as unknown as { __PP_DRAG__?: string }).__PP_DRAG__ = undefined;
      onDragStateChange?.(false);
    },
  });

  const grouped = useMemo(() => {
    const entries = (manifest?.manifest ?? []).filter(
      (entry) =>
        !query ||
        entry.meta.name.toLowerCase().includes(query.toLowerCase()) ||
        entry.meta.key.includes(query.toLowerCase()),
    );
    return CATEGORY_ORDER.map((category) => ({
      category,
      entries: entries.filter((entry) => entry.meta.category === category),
    })).filter((group) => group.entries.length > 0);
  }, [manifest, query]);

  const customWidgets = (manifest?.customWidgets ?? []).filter(
    (widget) => !query || widget.name.toLowerCase().includes(query.toLowerCase()),
  );
  const globalWidgets = (manifest?.globalWidgets ?? []).filter(
    (widget) => !query || widget.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="p-2">
        <div className="relative">
          <MagnifyingGlass size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search widgets…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-2 pb-3">
        {grouped.map((group) => (
          <div key={group.category}>
            <p className="px-1 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">{group.category}</p>
            <div className="grid grid-cols-2 gap-1.5">
              {group.entries.map((entry) => (
                <button
                  key={entry.meta.key}
                  type="button"
                  onClick={() => onInsert(entry)}
                  {...dragProps({ kind: "manifest", key: entry.meta.key })}
                  className={cn(
                    "studio-focus group rounded-lg border border-hairline bg-app p-2 text-left",
                    "hover:border-brand/50 hover:bg-brand-soft/40",
                  )}
                  title={entry.meta.description}
                >
                  <span className="block truncate text-xs font-medium text-ink group-hover:text-brand">
                    {entry.meta.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
        {customWidgets.length > 0 ? (
          <div>
            <p className="px-1 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">Custom</p>
            <div className="grid grid-cols-2 gap-1.5">
              {customWidgets.map((widget) => (
                <button
                  key={widget.id}
                  type="button"
                  onClick={() => onInsert({ customId: widget.id })}
                  {...dragProps({ kind: "custom", id: widget.id })}
                  className="studio-focus group rounded-lg border border-hairline bg-app p-2 text-left hover:border-brand/50"
                  title={widget.description ?? undefined}
                >
                  <span className="block truncate text-xs font-medium text-ink group-hover:text-brand">{widget.name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {globalWidgets.length > 0 ? (
          <div>
            <p className="px-1 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">Global</p>
            <div className="grid grid-cols-2 gap-1.5">
              {globalWidgets.map((widget) => (
                <button
                  key={widget.id}
                  type="button"
                  onClick={() => onInsert({ globalId: widget.id, type: widget.type })}
                  {...dragProps({ kind: "global", id: widget.id, type: widget.type })}
                  className="studio-focus group rounded-lg border border-hairline bg-app p-2 text-left hover:border-brand/50"
                >
                  <span className="block truncate text-xs font-medium text-ink group-hover:text-brand">{widget.name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {grouped.length === 0 && customWidgets.length === 0 && globalWidgets.length === 0 ? (
          <p className="px-1 py-6 text-center text-xs text-muted">No widgets match &quot;{query}&quot;.</p>
        ) : null}
      </div>
      <p className="flex items-center gap-1 border-t border-hairline px-3 py-1.5 text-[11px] text-muted">
        <Plus size={11} />
        Click to append, or drag onto the canvas
      </p>
    </div>
  );
};

export default BuilderPalette;
