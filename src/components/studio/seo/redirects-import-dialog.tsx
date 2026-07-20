"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiClientError } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ImportResult = { imported: number; errors: string[] };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const RedirectsImportDialog = ({ open, onOpenChange }: Props) => {
  const queryClient = useQueryClient();
  const [csv, setCsv] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);

  const importMutation = useMutation({
    mutationFn: () => api.put<ImportResult>("/api/studio/redirects", { csv }),
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["redirects"] });
      if (data.errors.length === 0) toast.success(`Imported ${data.imported} redirect${data.imported === 1 ? "" : "s"}`);
      else toast.warning(`Imported ${data.imported}, ${data.errors.length} failed`);
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Import failed"),
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setCsv("");
      setResult(null);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Import redirects from CSV</DialogTitle>
          <DialogDescription>One redirect per line: from,to,308 (or 307 for temporary).</DialogDescription>
        </DialogHeader>
        <Textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          rows={8}
          placeholder={"/old-pricing,/pricing,308\n/temp-offer,/offers,307"}
          className="font-mono text-xs"
        />
        {result ? (
          <div className="rounded-lg border border-hairline bg-app p-3 text-xs">
            <p className="text-success">{result.imported} imported</p>
            {result.errors.length > 0 ? (
              <ul className="mt-1 list-inside list-disc space-y-0.5 text-danger">
                {result.errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => handleOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => importMutation.mutate()} disabled={importMutation.isPending || !csv.trim()}>
            {importMutation.isPending ? "Importing…" : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RedirectsImportDialog;
