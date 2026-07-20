"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowCounterClockwise, FolderSimple, Trash, X } from "@phosphor-icons/react";
import { api, ApiClientError } from "@/services/api";
import type { MediaRow } from "@/services/media";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/studio/shared/confirm-dialog";
import MoveToFolderDialog from "@/components/studio/media/move-to-folder-dialog";
import type { MediaView } from "@/components/studio/media/media-lib";

type Props = {
  view: MediaView;
  selectedIds: string[];
  onClearSelection: () => void;
};

const BulkActionsBar = ({ view, selectedIds, onClearSelection }: Props) => {
  const queryClient = useQueryClient();
  const [moveOpen, setMoveOpen] = useState(false);
  const [trashOpen, setTrashOpen] = useState(false);
  const [purgeOpen, setPurgeOpen] = useState(false);

  const count = selectedIds.length;
  const label = `${count} file${count === 1 ? "" : "s"}`;

  const done = (message: string) => {
    toast.success(message);
    queryClient.invalidateQueries({ queryKey: ["media"] });
    onClearSelection();
  };
  const fail = (err: unknown, fallback: string) =>
    toast.error(err instanceof ApiClientError ? err.message : fallback);

  const moveMutation = useMutation({
    mutationFn: async (folderId: string | null) => {
      for (const id of selectedIds) {
        await api.patch<MediaRow>(`/api/studio/media/${id}`, { folderId });
      }
    },
    onSuccess: () => {
      setMoveOpen(false);
      done(`Moved ${label}`);
    },
    onError: (err) => fail(err, "Move failed"),
  });

  const trashMutation = useMutation({
    mutationFn: async () => {
      for (const id of selectedIds) {
        await api.del(`/api/studio/media/${id}`);
      }
    },
    onSuccess: () => done(`Moved ${label} to trash`),
    onError: (err) => fail(err, "Trash failed"),
  });

  const restoreMutation = useMutation({
    mutationFn: () => api.post("/api/studio/media/restore", { ids: selectedIds }),
    onSuccess: () => done(`Restored ${label}`),
    onError: (err) => fail(err, "Restore failed"),
  });

  const purgeMutation = useMutation({
    mutationFn: async () => {
      for (const id of selectedIds) {
        await api.del(`/api/studio/media/${id}?purge=1`);
      }
    },
    onSuccess: () => done(`Deleted ${label} forever`),
    onError: (err) => fail(err, "Delete failed"),
  });

  const busy = moveMutation.isPending || trashMutation.isPending || restoreMutation.isPending || purgeMutation.isPending;

  return (
    <div className="flex items-center gap-2 border-b border-hairline bg-brand-soft px-4 py-2">
      <span className="text-sm font-medium text-brand">{label} selected</span>
      <div className="ml-auto flex items-center gap-2">
        {view.type === "trash" ? (
          <>
            <Button size="sm" variant="secondary" disabled={busy} onClick={() => restoreMutation.mutate()}>
              <ArrowCounterClockwise size={14} className="mr-1.5" />
              Restore
            </Button>
            <Button size="sm" variant="destructive" disabled={busy} onClick={() => setPurgeOpen(true)}>
              <Trash size={14} className="mr-1.5" />
              Delete forever
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" variant="secondary" disabled={busy} onClick={() => setMoveOpen(true)}>
              <FolderSimple size={14} className="mr-1.5" />
              Move to folder
            </Button>
            <Button size="sm" variant="destructive" disabled={busy} onClick={() => setTrashOpen(true)}>
              <Trash size={14} className="mr-1.5" />
              Trash
            </Button>
          </>
        )}
        <Button size="sm" variant="ghost" aria-label="Clear selection" onClick={onClearSelection}>
          <X size={14} />
        </Button>
      </div>

      <MoveToFolderDialog
        open={moveOpen}
        onOpenChange={setMoveOpen}
        count={count}
        moving={moveMutation.isPending}
        onMove={(folderId) => moveMutation.mutate(folderId)}
      />
      <ConfirmDialog
        open={trashOpen}
        onOpenChange={setTrashOpen}
        title={`Move ${label} to trash?`}
        description="Trashed files stay recoverable from the Trash view until deleted forever."
        confirmLabel="Move to trash"
        onConfirm={() => {
          trashMutation.mutate();
          setTrashOpen(false);
        }}
      />
      <ConfirmDialog
        open={purgeOpen}
        onOpenChange={setPurgeOpen}
        title={`Delete ${label} forever?`}
        description="The files and their stored data are removed permanently. This cannot be undone."
        confirmLabel="Delete forever"
        onConfirm={() => {
          purgeMutation.mutate();
          setPurgeOpen(false);
        }}
      />
    </div>
  );
};

export default BulkActionsBar;
