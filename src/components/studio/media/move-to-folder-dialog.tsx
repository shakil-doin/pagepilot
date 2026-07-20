"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { MediaFolderRow } from "@/components/studio/media/media-lib";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  moving: boolean;
  onMove: (folderId: string | null) => void;
};

const ROOT = "__root__";

const MoveToFolderDialog = ({ open, onOpenChange, count, moving, onMove }: Props) => {
  const [target, setTarget] = useState<string>(ROOT);

  const { data: folders } = useQuery({
    queryKey: ["media-folders"],
    queryFn: () => api.get<MediaFolderRow[]>("/api/studio/media/folders"),
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            Move {count} file{count === 1 ? "" : "s"}
          </DialogTitle>
          <DialogDescription>Pick the destination folder.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label>Folder</Label>
          <Select value={target} onValueChange={setTarget}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ROOT}>All files (no folder)</SelectItem>
              {(folders ?? []).map((folder) => (
                <SelectItem key={folder.id} value={folder.id}>
                  {folder.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={moving} onClick={() => onMove(target === ROOT ? null : target)}>
            {moving ? "Moving…" : "Move"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MoveToFolderDialog;
