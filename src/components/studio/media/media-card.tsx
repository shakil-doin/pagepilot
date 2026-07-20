"use client";

import { FileText, VideoCamera } from "@phosphor-icons/react";
import { cn, formatBytes, timeAgo } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import type { MediaRow } from "@/services/media";
import { isMissingAlt } from "@/components/studio/media/media-lib";

type Props = {
  media: MediaRow;
  layout: "grid" | "list";
  selected: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
};

const FilePreview = ({ media, iconSize }: { media: MediaRow; iconSize: number }) =>
  media.kind === "IMAGE" ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={media.url} alt={media.alt ?? media.filename} className="h-full w-full object-cover" loading="lazy" />
  ) : (
    <span className="flex h-full w-full items-center justify-center text-muted">
      {media.kind === "VIDEO" ? <VideoCamera size={iconSize} /> : <FileText size={iconSize} />}
    </span>
  );

const MediaCard = ({ media, layout, selected, onToggleSelect, onOpen }: Props) => {
  const checkbox = (
    <Checkbox
      checked={selected}
      onCheckedChange={onToggleSelect}
      onClick={(e) => e.stopPropagation()}
      aria-label={`Select ${media.filename}`}
    />
  );

  if (layout === "list") {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => e.key === "Enter" && onOpen()}
        className={cn(
          "group flex w-full cursor-pointer items-center gap-3 border-b border-hairline px-3 py-2 text-left transition-colors last:border-b-0 hover:bg-app",
          selected && "bg-brand-soft/40",
        )}
      >
        {checkbox}
        <span className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-hairline bg-app">
          <FilePreview media={media} iconSize={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-ink">{media.filename}</span>
          <span className="block text-xs text-muted">
            {formatBytes(media.sizeBytes)} · {timeAgo(media.createdAt)}
          </span>
        </span>
        {isMissingAlt(media) ? <Badge variant="danger">no alt</Badge> : null}
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-xl border bg-surface transition-colors",
        selected ? "border-brand" : "border-hairline hover:border-brand/50",
      )}
    >
      <div className="aspect-square bg-app">
        <FilePreview media={media} iconSize={28} />
      </div>
      <div
        className={cn(
          "absolute top-1.5 left-1.5 rounded bg-surface/90 p-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
          selected && "opacity-100",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {checkbox}
      </div>
      {isMissingAlt(media) ? (
        <Badge variant="danger" className="absolute top-1.5 right-1.5 bg-danger text-white">
          no alt
        </Badge>
      ) : null}
      <p className="truncate border-t border-hairline px-2 py-1.5 text-xs text-body" title={media.filename}>
        {media.filename}
      </p>
    </div>
  );
};

export default MediaCard;
