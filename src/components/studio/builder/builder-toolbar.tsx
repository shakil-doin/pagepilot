"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUUpLeft,
  ArrowUUpRight,
  DeviceMobile,
  DeviceTablet,
  Desktop,
  CaretDown,
  ClockCounterClockwise,
  Eye,
  FloppyDisk,
  WarningCircle,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import RevisionsDialog from "@/components/studio/builder/revisions-dialog";
import PublishDialog from "@/components/studio/builder/publish-dialog";
import PageSeoDialog from "@/components/studio/builder/page-seo-dialog";
import type { SeoPanelValue } from "@/components/studio/seo/seo-panel";
import { cn } from "@/lib/utils";
import type { Device } from "@/components/studio/builder/builder-canvas";
import type { SaveState, StudioPage } from "@/components/studio/builder/use-builder";
import type { PublishBlocker } from "@/types";

type Props = {
  page: StudioPage;
  pageId: string;
  saveState: SaveState;
  device: Device;
  onDeviceChange: (device: Device) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onSaveDraft: () => void;
  onPublish: (note?: string) => void;
  publishing: boolean;
  blockers: PublishBlocker[];
};

const SAVE_LABEL: Record<SaveState, string> = {
  saved: "Saved ✓",
  saving: "Saving…",
  dirty: "Unsaved changes",
  offline: "Offline",
};

const DEVICES: { key: Device; icon: typeof Desktop; label: string }[] = [
  { key: "desktop", icon: Desktop, label: "Desktop" },
  { key: "tablet", icon: DeviceTablet, label: "Tablet (768px)" },
  { key: "mobile", icon: DeviceMobile, label: "Mobile (390px)" },
];

const BuilderToolbar = ({
  page,
  pageId,
  saveState,
  device,
  onDeviceChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onSaveDraft,
  onPublish,
  publishing,
  blockers,
}: Props) => {
  const [revisionsOpen, setRevisionsOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);

  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-hairline bg-surface px-3">
      <div className="flex min-w-0 items-center gap-2">
        <Button variant="ghost" size="icon" asChild aria-label="Back to pages">
          <Link href="/studio/pages">
            <ArrowLeft size={16} />
          </Link>
        </Button>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{page.title}</p>
        </div>
        <span className="truncate font-mono text-xs text-muted">{page.path}</span>
        <span
          className={cn(
            "ml-2 shrink-0 text-xs",
            saveState === "saved" && "text-success",
            saveState === "saving" && "text-muted",
            (saveState === "dirty" || saveState === "offline") && "text-warning",
          )}
        >
          {SAVE_LABEL[saveState]}
        </span>
        {blockers.length > 0 ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-1 text-xs text-warning">
                <WarningCircle size={14} />
                {blockers.length}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {blockers.length} issue{blockers.length === 1 ? "" : "s"} will block publish
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>

      <div className="flex items-center gap-1 rounded-lg bg-app p-0.5">
        {DEVICES.map(({ key, icon: Icon, label }) => (
          <Tooltip key={key}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => onDeviceChange(key)}
                aria-label={label}
                className={cn(
                  "studio-focus rounded-md p-1.5",
                  device === key ? "bg-surface text-brand shadow-sm" : "text-muted hover:text-ink",
                )}
              >
                <Icon size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}
      </div>

      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="icon" onClick={onUndo} disabled={!canUndo} aria-label="Undo">
          <ArrowUUpLeft size={16} />
        </Button>
        <Button variant="ghost" size="icon" onClick={onRedo} disabled={!canRedo} aria-label="Redo">
          <ArrowUUpRight size={16} />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setRevisionsOpen(true)} aria-label="Revision history">
          <ClockCounterClockwise size={16} />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onSaveDraft}
          disabled={saveState === "saving" || saveState === "saved"}
          title="Save draft (⌘/Ctrl+S)"
        >
          <FloppyDisk size={14} className="mr-1.5" />
          {saveState === "saving" ? "Saving…" : "Save draft"}
        </Button>
        <Button variant="secondary" size="sm" asChild>
          <a href={`/api/preview?path=${encodeURIComponent(page.path)}`} target="_blank" rel="noreferrer">
            <Eye size={14} className="mr-1.5" />
            Preview
          </a>
        </Button>
        <div className="flex items-center">
          <Button size="sm" className="rounded-r-none" onClick={() => setPublishOpen(true)} disabled={publishing}>
            {publishing ? "Publishing…" : "Publish"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="rounded-l-none border-l border-white/25 px-1.5" aria-label="Publish options">
                <CaretDown size={12} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setPublishOpen(true)}>Publish with note…</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setSeoOpen(true)}>SEO settings…</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setRevisionsOpen(true)}>Revision history</DropdownMenuItem>
              {page.status === "PUBLISHED" ? (
                <DropdownMenuItem asChild>
                  <a href={page.path} target="_blank" rel="noreferrer">
                    View live page
                  </a>
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {page.status !== "PUBLISHED" ? <Badge variant="warning">draft</Badge> : null}
      </div>

      <PageSeoDialog
        pageId={pageId}
        open={seoOpen}
        onOpenChange={setSeoOpen}
        initial={page.seo as SeoPanelValue | null}
        pageTitle={page.title}
        pagePath={page.path}
      />
      <RevisionsDialog open={revisionsOpen} onOpenChange={setRevisionsOpen} pageId={pageId} />
      <PublishDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        blockers={blockers}
        onPublish={(note) => {
          setPublishOpen(false);
          onPublish(note);
        }}
      />
    </div>
  );
};

export default BuilderToolbar;
