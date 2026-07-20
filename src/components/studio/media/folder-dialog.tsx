"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiClientError } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MediaFolderRow } from "@/components/studio/media/media-lib";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // When set, the dialog renames this folder; otherwise it creates a new one.
  renaming?: MediaFolderRow | null;
  parentId?: string | null;
  parentName?: string | null;
};

const FolderDialog = ({ open, onOpenChange, renaming = null, parentId = null, parentName = null }: Props) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) setName(renaming?.name ?? "");
  }, [open, renaming]);

  const mutation = useMutation({
    mutationFn: () =>
      renaming
        ? api.patch("/api/studio/media/folders", { id: renaming.id, name })
        : api.post("/api/studio/media/folders", { name, parentId }),
    onSuccess: () => {
      toast.success(renaming ? "Folder renamed" : `Folder "${name}" created`);
      queryClient.invalidateQueries({ queryKey: ["media-folders"] });
      onOpenChange(false);
    },
    onError: (err) =>
      toast.error(err instanceof ApiClientError ? err.message : renaming ? "Rename failed" : "Could not create the folder"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{renaming ? `Rename "${renaming.name}"` : "New folder"}</DialogTitle>
          {!renaming ? (
            <DialogDescription>
              {parentName ? `The folder is created inside "${parentName}".` : "The folder is created at the top level."}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="folder-name">Name</Label>
            <Input
              id="folder-name"
              placeholder="Brand assets"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending || !name.trim()}>
              {mutation.isPending ? "Saving…" : renaming ? "Rename" : "Create folder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FolderDialog;
