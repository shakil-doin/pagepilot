"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight, Plus, Trash, UploadSimple } from "@phosphor-icons/react";
import { api, ApiClientError } from "@/services/api";
import { timeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ConfirmDialog from "@/components/studio/shared/confirm-dialog";
import RedirectsImportDialog from "@/components/studio/seo/redirects-import-dialog";

type RedirectRow = {
  id: string;
  fromPath: string;
  toPath: string;
  permanent: boolean;
  createdAt: string;
};

const RedirectsPanel = () => {
  const queryClient = useQueryClient();
  const [fromPath, setFromPath] = useState("");
  const [toPath, setToPath] = useState("");
  const [permanent, setPermanent] = useState(true);
  const [importOpen, setImportOpen] = useState(false);
  const [deleting, setDeleting] = useState<RedirectRow | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["redirects"],
    queryFn: () => api.get<RedirectRow[]>("/api/studio/redirects"),
  });

  const createMutation = useMutation({
    mutationFn: () => api.post("/api/studio/redirects", { fromPath, toPath, permanent }),
    onSuccess: () => {
      toast.success("Redirect added");
      setFromPath("");
      setToPath("");
      queryClient.invalidateQueries({ queryKey: ["redirects"] });
    },
    // Surface service errors like loop or self-reference detection.
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Could not add the redirect"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/api/studio/redirects/${id}`),
    onSuccess: () => {
      toast.success("Redirect deleted");
      queryClient.invalidateQueries({ queryKey: ["redirects"] });
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Delete failed"),
  });

  return (
    <div className="space-y-4">
      <form
        className="flex flex-wrap items-end gap-3 rounded-xl border border-hairline bg-surface p-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (fromPath.trim() && toPath.trim()) createMutation.mutate();
        }}
      >
        <div className="min-w-40 flex-1 space-y-1.5">
          <Label htmlFor="redirect-from">From path</Label>
          <Input
            id="redirect-from"
            placeholder="/old-page"
            value={fromPath}
            onChange={(e) => setFromPath(e.target.value)}
            className="font-mono text-xs"
          />
        </div>
        <div className="min-w-40 flex-1 space-y-1.5">
          <Label htmlFor="redirect-to">To path</Label>
          <Input
            id="redirect-to"
            placeholder="/new-page"
            value={toPath}
            onChange={(e) => setToPath(e.target.value)}
            className="font-mono text-xs"
          />
        </div>
        <div className="flex h-9 items-center gap-2">
          <Switch id="redirect-permanent" checked={permanent} onCheckedChange={setPermanent} />
          <Label htmlFor="redirect-permanent" className="text-xs">
            Permanent (308)
          </Label>
        </div>
        <Button type="submit" disabled={createMutation.isPending || !fromPath.trim() || !toPath.trim()}>
          <Plus size={15} className="mr-1.5" />
          Add
        </Button>
        <Button type="button" variant="secondary" onClick={() => setImportOpen(true)}>
          <UploadSimple size={15} className="mr-1.5" />
          Import CSV
        </Button>
      </form>

      {isLoading ? (
        <p className="py-16 text-center text-sm text-muted">Loading redirects…</p>
      ) : (data ?? []).length === 0 ? (
        <div className="rounded-xl border border-dashed border-hairline py-16 text-center">
          <p className="text-sm font-medium text-ink">No redirects yet</p>
          <p className="mt-1 text-sm text-muted">Add one above or import a CSV.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-hairline bg-surface">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Redirect</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data ?? []).map((redirect) => (
                <TableRow key={redirect.id}>
                  <TableCell>
                    <span className="flex items-center gap-2 font-mono text-xs text-ink">
                      {redirect.fromPath}
                      <ArrowRight size={12} className="shrink-0 text-muted" />
                      <span className="truncate">{redirect.toPath}</span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={redirect.permanent ? "info" : "outline"}>{redirect.permanent ? "308" : "307"}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted">{timeAgo(redirect.createdAt)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted hover:text-danger"
                      aria-label={`Delete redirect from ${redirect.fromPath}`}
                      onClick={() => setDeleting(redirect)}
                    >
                      <Trash size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <RedirectsImportDialog open={importOpen} onOpenChange={setImportOpen} />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete redirect from ${deleting?.fromPath}?`}
        description={`Visitors to ${deleting?.fromPath} will no longer be sent to ${deleting?.toPath}.`}
        confirmLabel="Delete redirect"
        onConfirm={() => {
          if (deleting) deleteMutation.mutate(deleting.id);
          setDeleting(null);
        }}
      />
    </div>
  );
};

export default RedirectsPanel;
