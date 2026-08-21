"use client";

import { FileText, VideoCamera, Warning } from "@phosphor-icons/react";
import { cn, formatBytes, timeAgo } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
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
    <img
      src={media.url}
      alt={media.alt ?? media.filename}
      className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
      loading="lazy"
      draggable={false}
    />
  ) : (
    <span className="flex h-full w-full items-center justify-center text-brand/45">
      {media.kind === "VIDEO" ? <VideoCamera size={iconSize} weight="duotone" /> : <FileText size={iconSize} weight="duotone" />}
    </span>
  );

const MediaCard = ({ media, layout, selected, onToggleSelect, onOpen }: Props) => {
  // A selection control floats over arbitrary images, so it can't rely on theme
  // colors for contrast. Over the grid thumbnail it gets a solid white face with
  // a shadow + ring so it's legible on any photo, light or dark; checked turns
  // brand-colored with a white tick (from the base Checkbox styles).
  const renderCheckbox = (className?: string) => (
    <Checkbox
      checked={selected}
      onCheckedChange={onToggleSelect}
      onClick={(e) => e.stopPropagation()}
      aria-label={`Select ${media.filename}`}
      className={className}
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
          "group flex w-full cursor-pointer items-center gap-3 border-b border-hairline px-3 py-2 text-left outline-none transition-colors last:border-b-0",
          selected ? "bg-brand-soft/50" : "hover:bg-app focus-visible:bg-app",
        )}
      >
        <span onClick={(e) => e.stopPropagation()} className={cn("transition-opacity", selected ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100")}>
          {renderCheckbox()}
        </span>
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-linear-to-br from-app to-brand-soft/40",
            selected ? "border-brand/40" : "border-hairline",
          )}
        >
          <FilePreview media={media} iconSize={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-ink">{media.filename}</span>
          <span className="block text-xs text-muted">
            {formatBytes(media.sizeBytes)} · {timeAgo(media.createdAt)}
          </span>
        </span>
        {isMissingAlt(media) ? (
          <span className="flex shrink-0 items-center gap-1 rounded-md bg-danger/10 px-1.5 py-0.5 text-[11px] font-semibold text-danger">
            <Warning size={11} weight="fill" />
            no alt
          </span>
        ) : null}
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
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-surface shadow-sm outline-none transition-all duration-200 ease-out",
        "hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-brand/40",
        selected ? "border-brand ring-2 ring-brand/30" : "border-hairline hover:border-brand/40",
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-linear-to-br from-app to-brand-soft/30">
        <FilePreview media={media} iconSize={30} />

        {/* Scrim keeps the checkbox legible over bright images */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-14 bg-linear-to-b from-black/30 to-transparent transition-opacity",
            selected ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
          )}
        />

        {/* Selection checkbox: solid white face so it reads on any image */}
        <div
          className={cn(
            "absolute top-2 left-2 transition-opacity",
            selected ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {renderCheckbox("h-5 w-5 bg-white shadow-md ring-1 ring-black/15 data-[state=checked]:ring-brand/40")}
        </div>

        {/* Type chip for non-image assets */}
        {media.kind !== "IMAGE" ? (
          <span className="absolute bottom-2 left-2 rounded-md bg-surface/85 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-muted uppercase ring-1 ring-black/5 backdrop-blur-sm">
            {media.kind}
          </span>
        ) : null}

        {/* Missing-alt warning */}
        {isMissingAlt(media) ? (
          <span className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-danger px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
            <Warning size={10} weight="fill" />
            no alt
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-2 border-t border-hairline px-2.5 py-2">
        <span className="min-w-0 flex-1 truncate text-xs font-medium text-body" title={media.filename}>
          {media.filename}
        </span>
        <span className="shrink-0 text-[10px] text-muted tabular-nums">{formatBytes(media.sizeBytes)}</span>
      </div>
    </div>
  );
};

export default MediaCard;
