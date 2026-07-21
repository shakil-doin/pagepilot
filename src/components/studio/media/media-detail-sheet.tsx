"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowCounterClockwise, FileText, Trash, VideoCamera, Warning } from "@phosphor-icons/react";
import { api, ApiClientError } from "@/services/api";
import type { MediaRow } from "@/services/media";
import { formatBytes, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import ConfirmDialog from "@/components/studio/shared/confirm-dialog";
import FocalPointPicker from "@/components/studio/media/focal-point-picker";
import { usageSummary, type MediaUsage } from "@/components/studio/media/media-lib";

type Props = {
  mediaId: string | null;
  onOpenChange: (open: boolean) => void;
};

type DetailResponse = { media: MediaRow; usage: MediaUsage };

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-3 text-xs">
    <span className="text-muted">{label}</span>
    <span className="text-right text-body">{value}</span>
  </div>
);

const MediaDetailSheet = ({ mediaId, onOpenChange }: Props) => {
  const queryClient = useQueryClient();
  const [filename, setFilename] = useState("");
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [trashOpen, setTrashOpen] = useState(false);
  const [purgeOpen, setPurgeOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["media-detail", mediaId],
    queryFn: () => api.get<DetailResponse>(`/api/studio/media/${mediaId}`),
    enabled: mediaId !== null,
  });

  const media = data?.media;
  const usage = data?.usage;

  // Sync local form fields whenever a different file is loaded.
  useEffect(() => {
    if (media) {
      setFilename(media.filename);
      setAlt(media.alt ?? "");
      setCaption(media.caption ?? "");
    }
  }, [media]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["media"] });
    queryClient.invalidateQueries({ queryKey: ["media-detail", mediaId] });
  };

  const saveMutation = useMutation({
    mutationFn: () => api.patch<MediaRow>(`/api/studio/media/${mediaId}`, { filename, alt, caption }),
    onSuccess: () => {
      toast.success("Details saved");
      invalidate();
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Save failed"),
  });

  const focalMutation = useMutation({
    mutationFn: (point: { focalX: number; focalY: number }) => api.patch<MediaRow>(`/api/studio/media/${mediaId}`, point),
    onSuccess: () => {
      toast.success("Focal point updated");
      invalidate();
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Could not set the focal point"),
  });

  const trashMutation = useMutation({
    mutationFn: () => api.del(`/api/studio/media/${mediaId}`),
    onSuccess: () => {
      toast.success("File moved to trash");
      queryClient.invalidateQueries({ queryKey: ["media"] });
      onOpenChange(false);
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Trash failed"),
  });

  const restoreMutation = useMutation({
    mutationFn: () => api.post("/api/studio/media/restore", { ids: [mediaId] }),
    onSuccess: () => {
      toast.success("File restored");
      queryClient.invalidateQueries({ queryKey: ["media"] });
      onOpenChange(false);
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Restore failed"),
  });

  // Permanent delete: also removes the asset from ImageKit (see purgeMedia).
  const purgeMutation = useMutation({
    mutationFn: () => api.del(`/api/studio/media/${mediaId}?purge=1`),
    onSuccess: () => {
      toast.success("File deleted forever");
      queryClient.invalidateQueries({ queryKey: ["media"] });
      onOpenChange(false);
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Delete failed"),
  });

  const trashBusy = restoreMutation.isPending || purgeMutation.isPending;

  const dirty =
    media !== undefined &&
    (filename !== media.filename || alt !== (media.alt ?? "") || caption !== (media.caption ?? ""));
  const usedAnywhere = usage !== undefined && (usage.pages.length > 0 || usage.posts.length > 0 || usage.seoCount > 0);
  const missingAlt = media?.kind === "IMAGE" && alt.trim() === "";

  return (
    <Sheet open={mediaId !== null} onOpenChange={onOpenChange}>
      <SheetContent className="w-[26rem] gap-0 overflow-y-auto p-0 sm:w-[30rem]">
        {isLoading || !media || !usage ? (
          <div className="flex h-full items-center justify-center">
            <Spinner className="text-muted" />
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-5">
            <SheetHeader>
              <SheetTitle className="truncate pr-8 text-base">{media.filename}</SheetTitle>
            </SheetHeader>

            {media.kind === "IMAGE" ? (
              <div className="space-y-2">
                <FocalPointPicker
                  url={media.url}
                  alt={media.alt ?? media.filename}
                  focalX={media.focalX}
                  focalY={media.focalY}
                  onChange={(focalX, focalY) => focalMutation.mutate({ focalX, focalY })}
                />
                <p className="text-xs text-muted">Click the image to set the focal point used when it is cropped.</p>
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-lg border border-hairline bg-app text-muted">
                {media.kind === "VIDEO" ? <VideoCamera size={40} /> : <FileText size={40} />}
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="media-filename">Filename</Label>
                <Input id="media-filename" value={filename} onChange={(e) => setFilename(e.target.value)} />
              </div>
              {media.kind === "IMAGE" ? (
                <div className="space-y-2">
                  <Label htmlFor="media-alt">Alt text</Label>
                  <Input
                    id="media-alt"
                    value={alt}
                    onChange={(e) => setAlt(e.target.value)}
                    placeholder="Describe the image for screen readers"
                    className={missingAlt ? "border-danger" : undefined}
                  />
                  {missingAlt ? (
                    <p className="flex items-center gap-1 text-xs text-danger">
                      <Warning size={12} />
                      Required before this image can be published
                    </p>
                  ) : null}
                </div>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="media-caption">Caption</Label>
                <Textarea
                  id="media-caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={2}
                  placeholder="Optional caption shown under the file"
                />
              </div>
              <Button
                size="sm"
                onClick={() => saveMutation.mutate()}
                disabled={!dirty || saveMutation.isPending || !filename.trim()}
              >
                {saveMutation.isPending ? "Saving…" : "Save details"}
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-wide text-muted uppercase">File info</p>
              <InfoRow label="Size" value={formatBytes(media.sizeBytes)} />
              {media.width && media.height ? <InfoRow label="Dimensions" value={`${media.width} × ${media.height}px`} /> : null}
              <InfoRow label="Type" value={media.mimeType} />
              <InfoRow label="Uploaded" value={formatDate(media.createdAt)} />
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-wide text-muted uppercase">Used in</p>
              {!usedAnywhere ? (
                <p className="text-xs text-muted">Not used anywhere yet.</p>
              ) : (
                <div className="space-y-1">
                  {usage.pages.map((page) => (
                    <Link
                      key={page.id}
                      href={`/studio/pages/${page.id}/builder`}
                      className="block truncate text-xs text-brand hover:underline"
                    >
                      {page.title} <span className="font-mono text-muted">{page.path}</span>
                    </Link>
                  ))}
                  {usage.posts.map((post) => (
                    <p key={post.id} className="truncate text-xs text-body">
                      Post: {post.title}
                    </p>
                  ))}
                  {usage.seoCount > 0 ? (
                    <p className="text-xs text-body">
                      {usage.seoCount} SEO setting{usage.seoCount === 1 ? "" : "s"} use this as the social image
                    </p>
                  ) : null}
                </div>
              )}
            </div>

            <Separator />

            {media.deletedAt === null ? (
              <Button variant="destructive" size="sm" onClick={() => setTrashOpen(true)} disabled={trashMutation.isPending}>
                <Trash size={14} className="mr-1.5" />
                Move to trash
              </Button>
            ) : (
              <div className="space-y-2">
                <Badge variant="danger" className="self-start">
                  In trash
                </Badge>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => restoreMutation.mutate()} disabled={trashBusy}>
                    <ArrowCounterClockwise size={14} className="mr-1.5" />
                    Restore
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setPurgeOpen(true)} disabled={trashBusy}>
                    <Trash size={14} className="mr-1.5" />
                    Delete forever
                  </Button>
                </div>
              </div>
            )}

            <ConfirmDialog
              open={trashOpen}
              onOpenChange={setTrashOpen}
              title={`Move "${media.filename}" to trash?`}
              description={
                usedAnywhere
                  ? `This file is still in use (${usageSummary(usage)})${
                      usage.pages.length ? `: ${usage.pages.map((p) => p.title).join(", ")}` : ""
                    }. Those places will show a broken file until you swap it out.`
                  : "You can restore it from the Trash view later."
              }
              confirmLabel="Move to trash"
              onConfirm={() => {
                trashMutation.mutate();
                setTrashOpen(false);
              }}
            />

            <ConfirmDialog
              open={purgeOpen}
              onOpenChange={setPurgeOpen}
              title={`Delete "${media.filename}" forever?`}
              description="The file and its stored data are removed permanently, including from ImageKit. This cannot be undone."
              confirmLabel="Delete forever"
              onConfirm={() => {
                purgeMutation.mutate();
                setPurgeOpen(false);
              }}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default MediaDetailSheet;
