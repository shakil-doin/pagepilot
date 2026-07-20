"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiClientError } from "@/services/api";
import { timeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageId: string;
};

type Revision = {
  id: string;
  version: number;
  note: string | null;
  createdAt: string;
  author: { id: string; name: string } | null;
};

const RevisionsDialog = ({ open, onOpenChange, pageId }: Props) => {
  const queryClient = useQueryClient();

  const { data: revisions } = useQuery({
    queryKey: ["revisions", pageId],
    queryFn: () => api.get<Revision[]>(`/api/studio/pages/${pageId}/revisions`),
    enabled: open,
  });

  const rollback = useMutation({
    mutationFn: (revisionId: string) => api.post(`/api/studio/pages/${pageId}/rollback`, { revisionId }),
    onSuccess: () => {
      toast.success("Rolled back. That version is live again.");
      queryClient.invalidateQueries({ queryKey: ["page", pageId] });
      onOpenChange(false);
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Rollback failed"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Revision history</DialogTitle>
          <DialogDescription>Publish any older version with one click. The draft stays untouched.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1">
          {(revisions ?? []).map((revision) => (
            <div key={revision.id} className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-app">
              <div>
                <p className="text-sm font-medium text-ink">
                  v{revision.version}
                  {revision.note ? <span className="ml-2 font-normal text-body">{revision.note}</span> : null}
                </p>
                <p className="text-xs text-muted">
                  {revision.author?.name ? `${revision.author.name} · ` : ""}
                  {timeAgo(revision.createdAt)}
                </p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => rollback.mutate(revision.id)} disabled={rollback.isPending}>
                Make live
              </Button>
            </div>
          ))}
          {(revisions ?? []).length === 0 ? <p className="py-8 text-center text-sm text-muted">No revisions yet.</p> : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RevisionsDialog;
