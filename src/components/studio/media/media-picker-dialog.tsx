"use client";

import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UploadSimple, FileText } from "@phosphor-icons/react";
import { api } from "@/services/api";
import { uploadFile, type MediaRow } from "@/services/media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accept?: "image" | "video" | "any";
  onPick: (media: MediaRow) => void;
};

const KIND_FOR_ACCEPT = { image: "IMAGE", video: "VIDEO", any: undefined } as const;

// The compact picker used by media/icon inspector controls and blog covers.
// The full library screen lives at /studio/media.
const MediaPickerDialog = ({ open, onOpenChange, accept = "any", onPick }: Props) => {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const kind = KIND_FOR_ACCEPT[accept];
  const { data, isLoading } = useQuery({
    queryKey: ["media-picker", kind, query],
    queryFn: () =>
      api.get<{ items: MediaRow[] }>(
        `/api/studio/media?${new URLSearchParams({ ...(kind ? { kind } : {}), ...(query ? { query } : {}) })}`,
      ),
    enabled: open,
  });

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const media = await uploadFile(files[0]);
      queryClient.invalidateQueries({ queryKey: ["media-picker"] });
      queryClient.invalidateQueries({ queryKey: ["media"] });
      onPick(media);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pick {accept === "any" ? "a file" : `a ${accept}`}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Input placeholder="Search by name or alt text…" value={query} onChange={(e) => setQuery(e.target.value)} className="h-8 text-xs" />
          <input
            ref={fileInput}
            type="file"
            hidden
            accept={accept === "image" ? "image/*" : accept === "video" ? "video/*" : undefined}
            onChange={(e) => handleFiles(e.target.files)}
          />
          <Button size="sm" variant="secondary" onClick={() => fileInput.current?.click()} disabled={uploading}>
            {uploading ? <Spinner className="mr-1.5" /> : <UploadSimple size={14} className="mr-1.5" />}
            Upload
          </Button>
        </div>
        <div
          className="grid max-h-96 grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-5"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
        >
          {isLoading ? (
            <p className="col-span-full py-10 text-center text-xs text-muted">Loading…</p>
          ) : (data?.items ?? []).length === 0 ? (
            <p className="col-span-full py-10 text-center text-xs text-muted">
              Nothing here yet. Upload or drop a file to get started.
            </p>
          ) : (
            (data?.items ?? []).map((media) => (
              <button
                key={media.id}
                type="button"
                onClick={() => {
                  onPick(media);
                  onOpenChange(false);
                }}
                className={cn(
                  "studio-focus group relative aspect-square overflow-hidden rounded-lg border border-hairline bg-app",
                  "hover:border-brand",
                )}
                title={media.filename}
              >
                {media.kind === "IMAGE" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={media.url} alt={media.alt ?? media.filename} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <span className="flex h-full w-full flex-col items-center justify-center gap-1 p-1 text-muted">
                    <FileText size={20} />
                    <span className="w-full truncate text-center text-[10px]">{media.filename}</span>
                  </span>
                )}
                {media.kind === "IMAGE" && !media.alt ? (
                  <span className="absolute left-1 top-1 rounded bg-danger px-1 text-[9px] font-semibold text-white">no alt</span>
                ) : null}
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaPickerDialog;
