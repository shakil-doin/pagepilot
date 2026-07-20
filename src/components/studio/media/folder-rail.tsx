"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CaretDown, CaretRight, DotsThree, Folder, FolderPlus, FolderSimple, Stack, Trash } from "@phosphor-icons/react";
import { api, ApiClientError } from "@/services/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConfirmDialog from "@/components/studio/shared/confirm-dialog";
import FolderDialog from "@/components/studio/media/folder-dialog";
import type { MediaFolderRow, MediaView } from "@/components/studio/media/media-lib";

type Props = {
  view: MediaView;
  onViewChange: (view: MediaView) => void;
};

type TreeNodeProps = {
  folder: MediaFolderRow;
  childrenByParent: Map<string | null, MediaFolderRow[]>;
  depth: number;
  view: MediaView;
  onViewChange: (view: MediaView) => void;
  onRename: (folder: MediaFolderRow) => void;
  onDelete: (folder: MediaFolderRow) => void;
};

const FolderTreeNode = ({ folder, childrenByParent, depth, view, onViewChange, onRename, onDelete }: TreeNodeProps) => {
  const [expanded, setExpanded] = useState(true);
  const children = childrenByParent.get(folder.id) ?? [];
  const active = view.type === "folder" && view.folderId === folder.id;

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-1 rounded-md pr-1 text-sm transition-colors",
          active ? "bg-brand-soft text-brand" : "text-body hover:bg-app",
        )}
        style={{ paddingLeft: `${depth * 14}px` }}
      >
        <button
          type="button"
          aria-label={expanded ? "Collapse folder" : "Expand folder"}
          className={cn("shrink-0 rounded p-0.5 text-muted hover:text-ink", children.length === 0 && "invisible")}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? <CaretDown size={12} /> : <CaretRight size={12} />}
        </button>
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-1.5 py-1.5 text-left"
          onClick={() => onViewChange({ type: "folder", folderId: folder.id })}
        >
          <Folder size={15} className="shrink-0" weight={active ? "fill" : "regular"} />
          <span className="truncate">{folder.name}</span>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`Actions for ${folder.name}`}
              className="rounded p-1 text-muted opacity-0 hover:text-ink focus-visible:opacity-100 group-hover:opacity-100"
            >
              <DotsThree size={16} weight="bold" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onSelect={() => onRename(folder)}>Rename</DropdownMenuItem>
            <DropdownMenuItem className="text-danger" onSelect={() => onDelete(folder)}>
              Delete folder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {expanded
        ? children.map((child) => (
            <FolderTreeNode
              key={child.id}
              folder={child}
              childrenByParent={childrenByParent}
              depth={depth + 1}
              view={view}
              onViewChange={onViewChange}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))
        : null}
    </div>
  );
};

const FolderRail = ({ view, onViewChange }: Props) => {
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState<MediaFolderRow | null>(null);
  const [deleting, setDeleting] = useState<MediaFolderRow | null>(null);

  const { data: folders } = useQuery({
    queryKey: ["media-folders"],
    queryFn: () => api.get<MediaFolderRow[]>("/api/studio/media/folders"),
  });

  const childrenByParent = useMemo(() => {
    const map = new Map<string | null, MediaFolderRow[]>();
    for (const folder of folders ?? []) {
      const key = folder.parentId ?? null;
      map.set(key, [...(map.get(key) ?? []), folder]);
    }
    return map;
  }, [folders]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/api/studio/media/folders?id=${encodeURIComponent(id)}`),
    onSuccess: (_, id) => {
      toast.success("Folder deleted, its files moved to All files");
      queryClient.invalidateQueries({ queryKey: ["media-folders"] });
      queryClient.invalidateQueries({ queryKey: ["media"] });
      if (view.type === "folder" && view.folderId === id) onViewChange({ type: "all" });
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Delete failed"),
  });

  // The dialog nests new folders under the current folder selection.
  const parent = view.type === "folder" ? ((folders ?? []).find((f) => f.id === view.folderId) ?? null) : null;

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-hairline bg-surface">
      <div className="flex items-center justify-between px-3 pt-3 pb-1">
        <span className="text-xs font-semibold tracking-wide text-muted uppercase">Folders</span>
        <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="New folder" onClick={() => setCreating(true)}>
          <FolderPlus size={16} />
        </Button>
      </div>
      <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 pb-2">
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors",
            view.type === "all" ? "bg-brand-soft text-brand" : "text-body hover:bg-app",
          )}
          onClick={() => onViewChange({ type: "all" })}
        >
          <Stack size={15} className="shrink-0" />
          All files
        </button>
        {(childrenByParent.get(null) ?? []).map((folder) => (
          <FolderTreeNode
            key={folder.id}
            folder={folder}
            childrenByParent={childrenByParent}
            depth={0}
            view={view}
            onViewChange={onViewChange}
            onRename={setRenaming}
            onDelete={setDeleting}
          />
        ))}
        {(folders ?? []).length === 0 ? (
          <p className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-muted">
            <FolderSimple size={14} />
            No folders yet
          </p>
        ) : null}
      </div>
      <div className="border-t border-hairline p-2">
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors",
            view.type === "trash" ? "bg-danger/10 text-danger" : "text-body hover:bg-app",
          )}
          onClick={() => onViewChange({ type: "trash" })}
        >
          <Trash size={15} className="shrink-0" />
          Trash
        </button>
      </div>

      <FolderDialog
        open={creating}
        onOpenChange={setCreating}
        parentId={parent?.id ?? null}
        parentName={parent?.name ?? null}
      />
      <FolderDialog open={renaming !== null} onOpenChange={(open) => !open && setRenaming(null)} renaming={renaming} />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete folder "${deleting?.name}"?`}
        description="Files inside are not deleted, they move back to All files. Subfolders keep their place in the tree."
        confirmLabel="Delete folder"
        onConfirm={() => {
          if (deleting) deleteMutation.mutate(deleting.id);
          setDeleting(null);
        }}
      />
    </aside>
  );
};

export default FolderRail;
