"use client";

import { useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UploadSimple } from "@phosphor-icons/react";
import { api } from "@/services/api";
import { uploadFile, type MediaRow } from "@/services/media";
import FolderRail from "@/components/studio/media/folder-rail";
import MediaToolbar from "@/components/studio/media/media-toolbar";
import MediaGrid from "@/components/studio/media/media-grid";
import BulkActionsBar from "@/components/studio/media/bulk-actions-bar";
import MediaDetailSheet from "@/components/studio/media/media-detail-sheet";
import { mediaListUrl, type MediaKindFilter, type MediaView } from "@/components/studio/media/media-lib";

const MediaScreen = () => {
  const queryClient = useQueryClient();
  const [view, setView] = useState<MediaView>({ type: "all" });
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<MediaKindFilter>("ALL");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailId, setDetailId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  // Counts nested dragenter/dragleave pairs so the overlay does not flicker.
  const dragDepth = useRef(0);

  const listQuery = useInfiniteQuery({
    queryKey: ["media", view, kind, query],
    queryFn: ({ pageParam }) =>
      api.get<{ items: MediaRow[]; nextCursor: string | null }>(mediaListUrl(view, kind, query, pageParam)),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const items = useMemo(() => (listQuery.data?.pages ?? []).flatMap((page) => page.items), [listQuery.data]);

  const changeView = (next: MediaView) => {
    setView(next);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleUpload = async (files: File[]) => {
    if (files.length === 0 || uploading || view.type === "trash") return;
    const folderId = view.type === "folder" ? view.folderId : null;
    setUploading(true);
    // Sequential uploads keep the presign/commit pipeline simple and the toasts readable.
    for (const file of files) {
      const toastId = toast.loading(`Uploading ${file.name}…`);
      try {
        await uploadFile(file, folderId);
        toast.success(`Uploaded ${file.name}`, { id: toastId });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : `Upload of ${file.name} failed`, { id: toastId });
      }
    }
    setUploading(false);
    queryClient.invalidateQueries({ queryKey: ["media"] });
    queryClient.invalidateQueries({ queryKey: ["media-picker"] });
  };

  return (
    <div className="flex h-full min-h-0">
      <FolderRail view={view} onViewChange={changeView} />
      <div
        className="relative flex min-w-0 flex-1 flex-col"
        onDragEnter={(e) => {
          e.preventDefault();
          if (view.type === "trash") return;
          dragDepth.current += 1;
          setDragActive(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => {
          dragDepth.current = Math.max(0, dragDepth.current - 1);
          if (dragDepth.current === 0) setDragActive(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          dragDepth.current = 0;
          setDragActive(false);
          handleUpload(Array.from(e.dataTransfer.files));
        }}
      >
        <MediaToolbar
          view={view}
          query={query}
          onQueryChange={setQuery}
          kind={kind}
          onKindChange={setKind}
          layout={layout}
          onLayoutChange={setLayout}
          uploading={uploading}
          onUpload={handleUpload}
        />
        {selectedIds.size > 0 ? (
          <BulkActionsBar view={view} selectedIds={[...selectedIds]} onClearSelection={() => setSelectedIds(new Set())} />
        ) : null}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <MediaGrid
            items={items}
            layout={layout}
            view={view}
            isLoading={listQuery.isLoading}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onOpen={(media) => setDetailId(media.id)}
            hasMore={listQuery.hasNextPage}
            isLoadingMore={listQuery.isFetchingNextPage}
            onLoadMore={() => listQuery.fetchNextPage()}
          />
        </div>
        {dragActive ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-none border-2 border-dashed border-brand bg-brand-soft/70">
            <p className="flex items-center gap-2 rounded-lg bg-surface px-4 py-2 text-sm font-medium text-brand shadow">
              <UploadSimple size={18} />
              Drop files to upload
            </p>
          </div>
        ) : null}
      </div>
      <MediaDetailSheet mediaId={detailId} onOpenChange={(open) => !open && setDetailId(null)} />
    </div>
  );
};

export default MediaScreen;
