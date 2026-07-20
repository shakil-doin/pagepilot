"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { MediaRow } from "@/services/media";
import MediaCard from "@/components/studio/media/media-card";
import type { MediaView } from "@/components/studio/media/media-lib";

type Props = {
  items: MediaRow[];
  layout: "grid" | "list";
  view: MediaView;
  isLoading: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onOpen: (media: MediaRow) => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
};

const MediaGrid = ({
  items,
  layout,
  view,
  isLoading,
  selectedIds,
  onToggleSelect,
  onOpen,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: Props) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="text-muted" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-4 my-8 rounded-xl border border-dashed border-hairline py-16 text-center">
        <p className="text-sm font-medium text-ink">{view.type === "trash" ? "Trash is empty" : "No files here"}</p>
        <p className="mt-1 text-sm text-muted">
          {view.type === "trash"
            ? "Trashed files show up here until they are restored or deleted forever."
            : "Upload files with the button above or drop them anywhere on this panel."}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {layout === "grid" ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((media) => (
            <MediaCard
              key={media.id}
              media={media}
              layout="grid"
              selected={selectedIds.has(media.id)}
              onToggleSelect={() => onToggleSelect(media.id)}
              onOpen={() => onOpen(media)}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-hairline bg-surface">
          {items.map((media) => (
            <MediaCard
              key={media.id}
              media={media}
              layout="list"
              selected={selectedIds.has(media.id)}
              onToggleSelect={() => onToggleSelect(media.id)}
              onOpen={() => onOpen(media)}
            />
          ))}
        </div>
      )}
      {hasMore ? (
        <div className="flex justify-center pt-4">
          <Button variant="secondary" size="sm" onClick={onLoadMore} disabled={isLoadingMore}>
            {isLoadingMore ? <Spinner className="mr-1.5" /> : null}
            Load more
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default MediaGrid;
