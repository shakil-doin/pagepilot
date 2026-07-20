"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiClientError } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ConfirmDialog from "@/components/studio/shared/confirm-dialog";

type DangerAction = "flush-cache" | "purge-trash";

const DangerZone = () => {
  const [confirming, setConfirming] = useState<DangerAction | null>(null);
  const [exporting, setExporting] = useState(false);

  const dangerMutation = useMutation({
    mutationFn: (action: DangerAction) => api.post<{ action: DangerAction; count: number }>("/api/studio/danger", { action }),
    onSuccess: (result) => {
      toast.success(
        result.action === "flush-cache"
          ? `Flushed ${result.count} cache tags`
          : `Purged ${result.count} trashed media file(s)`,
      );
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Action failed"),
  });

  const exportContent = async () => {
    setExporting(true);
    try {
      const data = await api.get<unknown>("/api/studio/export");
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "pagepilot-export.json";
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded");
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card className="border-danger/40">
      <CardHeader>
        <CardTitle className="text-sm text-danger">Danger zone</CardTitle>
        <p className="text-sm text-muted">These actions affect the whole site. Use with care.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-ink">Flush all caches</p>
            <p className="text-xs text-muted">Every page, menu, and setting re-renders on the next request.</p>
          </div>
          <Button variant="destructive" size="sm" onClick={() => setConfirming("flush-cache")}>
            Flush caches
          </Button>
        </div>
        <Separator />
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-ink">Purge trash now</p>
            <p className="text-xs text-muted">Permanently deletes all trashed media instead of waiting 30 days.</p>
          </div>
          <Button variant="destructive" size="sm" onClick={() => setConfirming("purge-trash")}>
            Purge trash
          </Button>
        </div>
        <Separator />
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-ink">Export content</p>
            <p className="text-xs text-muted">Download all pages, posts, settings, and widgets as JSON.</p>
          </div>
          <Button variant="secondary" size="sm" disabled={exporting} onClick={exportContent}>
            {exporting ? "Exporting…" : "Export content"}
          </Button>
        </div>
      </CardContent>

      <ConfirmDialog
        open={confirming === "flush-cache"}
        onOpenChange={(open) => !open && setConfirming(null)}
        title="Flush all caches?"
        description="All cached pages, menus, settings, and icons are invalidated. The next request to each page re-renders it."
        confirmLabel="Flush caches"
        onConfirm={() => {
          dangerMutation.mutate("flush-cache");
          setConfirming(null);
        }}
      />
      <ConfirmDialog
        open={confirming === "purge-trash"}
        onOpenChange={(open) => !open && setConfirming(null)}
        title="Purge trash now?"
        description="This permanently deletes all trashed media. Files cannot be restored afterwards."
        confirmLabel="Purge trash"
        onConfirm={() => {
          dangerMutation.mutate("purge-trash");
          setConfirming(null);
        }}
      />
    </Card>
  );
};

export default DangerZone;
