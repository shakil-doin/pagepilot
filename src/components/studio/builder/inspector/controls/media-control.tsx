"use client";

import { useState } from "react";
import { Image as ImageIcon, X } from "@phosphor-icons/react";
import MediaPickerDialog from "@/components/studio/media/media-picker-dialog";
import { toMediaRef } from "@/services/media";
import { Button } from "@/components/ui/button";

type MediaValue = { id?: string; url?: string; alt?: string; kind?: string };

type Props = {
  value: unknown;
  onChange: (value: unknown) => void;
  // Picking/removing an image is a discrete action: flush the save now so the
  // canvas (which only reflects saved state) updates immediately instead of
  // waiting out the typing debounce.
  onCommit?: () => void;
  accept?: "image" | "video" | "any";
};

const MediaControl = ({ value, onChange, onCommit, accept = "image" }: Props) => {
  const [open, setOpen] = useState(false);
  const media = (value ?? {}) as MediaValue;

  const pick = (next: unknown) => {
    onChange(next);
    onCommit?.();
  };

  return (
    <div>
      {media.url ? (
        <div className="group relative overflow-hidden rounded-lg border border-hairline">
          {media.kind === "IMAGE" || accept === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={media.url} alt={media.alt ?? ""} className="h-24 w-full object-cover" />
          ) : (
            <p className="truncate bg-app px-2 py-3 font-mono text-xs text-body">{media.url}</p>
          )}
          {media.kind === "IMAGE" && !media.alt ? (
            <span className="absolute left-1 top-1 rounded bg-danger px-1 text-[9px] font-semibold text-white">
              missing alt
            </span>
          ) : null}
          <div className="absolute inset-0 hidden items-center justify-center gap-2 bg-black/50 group-hover:flex">
            <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
              Replace
            </Button>
            <Button size="sm" variant="secondary" onClick={() => pick(undefined)} aria-label="Remove media">
              <X size={13} />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="studio-focus flex h-20 w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-hairline text-muted hover:border-brand hover:text-brand"
        >
          <ImageIcon size={18} />
          <span className="text-xs">Choose {accept === "any" ? "file" : accept}</span>
        </button>
      )}
      <MediaPickerDialog open={open} onOpenChange={setOpen} accept={accept} onPick={(row) => pick(toMediaRef(row))} />
    </div>
  );
};

export default MediaControl;
