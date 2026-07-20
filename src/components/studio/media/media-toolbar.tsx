"use client";

import { useRef } from "react";
import { List, MagnifyingGlass, SquaresFour, UploadSimple } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { MediaKindFilter, MediaView } from "@/components/studio/media/media-lib";

type Props = {
  view: MediaView;
  query: string;
  onQueryChange: (query: string) => void;
  kind: MediaKindFilter;
  onKindChange: (kind: MediaKindFilter) => void;
  layout: "grid" | "list";
  onLayoutChange: (layout: "grid" | "list") => void;
  uploading: boolean;
  onUpload: (files: File[]) => void;
};

const KIND_TABS: { value: MediaKindFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "IMAGE", label: "Images" },
  { value: "VIDEO", label: "Videos" },
  { value: "FILE", label: "Files" },
];

const MediaToolbar = ({ view, query, onQueryChange, kind, onKindChange, layout, onLayoutChange, uploading, onUpload }: Props) => {
  const fileInput = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-hairline bg-surface px-4 py-3">
      <div className="relative">
        <MagnifyingGlass size={14} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted" />
        <Input
          placeholder="Search by name or alt text…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="h-8 w-56 pl-8 text-xs"
        />
      </div>
      <Tabs value={kind} onValueChange={(value) => onKindChange(value as MediaKindFilter)}>
        <TabsList className="h-8">
          {KIND_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="px-2.5 py-1 text-xs">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="ml-auto flex items-center gap-2">
        <div className="flex items-center rounded-lg border border-hairline p-0.5">
          <button
            type="button"
            aria-label="Grid view"
            className={cn("rounded-md p-1.5", layout === "grid" ? "bg-brand-soft text-brand" : "text-muted hover:text-ink")}
            onClick={() => onLayoutChange("grid")}
          >
            <SquaresFour size={15} />
          </button>
          <button
            type="button"
            aria-label="List view"
            className={cn("rounded-md p-1.5", layout === "list" ? "bg-brand-soft text-brand" : "text-muted hover:text-ink")}
            onClick={() => onLayoutChange("list")}
          >
            <List size={15} />
          </button>
        </div>
        <input
          ref={fileInput}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            // Copy the FileList before clearing the input so re-picking the same file works.
            onUpload(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
        <Button size="sm" onClick={() => fileInput.current?.click()} disabled={uploading || view.type === "trash"}>
          {uploading ? <Spinner className="mr-1.5" /> : <UploadSimple size={14} className="mr-1.5" />}
          Upload
        </Button>
      </div>
    </div>
  );
};

export default MediaToolbar;
