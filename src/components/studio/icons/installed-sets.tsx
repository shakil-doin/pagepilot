"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash } from "@phosphor-icons/react";
import { api, ApiClientError } from "@/services/api";
import { timeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmDialog from "@/components/studio/shared/confirm-dialog";

export type IconSetRow = {
  id: string;
  prefix: string;
  name: string;
  installedAt: string;
};

const InstalledSets = () => {
  const queryClient = useQueryClient();
  const [uninstalling, setUninstalling] = useState<IconSetRow | null>(null);

  const { data: sets, isLoading } = useQuery({
    queryKey: ["icon-sets"],
    queryFn: () => api.get<IconSetRow[]>("/api/studio/icon-sets"),
  });

  const uninstallMutation = useMutation({
    mutationFn: (prefix: string) => api.del(`/api/studio/icon-sets/${prefix}`),
    onSuccess: () => {
      toast.success("Icon set uninstalled");
      queryClient.invalidateQueries({ queryKey: ["icon-sets"] });
      queryClient.invalidateQueries({ queryKey: ["icon-search"] });
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Uninstall failed"),
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  if ((sets ?? []).length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-hairline py-16 text-center">
        <p className="text-sm font-medium text-ink">No icon sets installed</p>
        <p className="mt-1 text-sm text-muted">Browse the catalog to install your first set.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(sets ?? []).map((set) => (
          <Card key={set.id}>
            <CardContent className="flex items-start justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{set.name}</p>
                <p className="font-mono text-xs text-muted">{set.prefix}</p>
                <p className="mt-1 text-xs text-muted">Installed {timeAgo(set.installedAt)}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Uninstall ${set.name}`}
                className="shrink-0 text-danger hover:bg-danger/10"
                onClick={() => setUninstalling(set)}
              >
                <Trash size={16} />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={uninstalling !== null}
        onOpenChange={(open) => !open && setUninstalling(null)}
        title={`Uninstall "${uninstalling?.name}"?`}
        description={`This removes the ${uninstalling?.prefix} set. Pages using these icons will render without them.`}
        confirmLabel="Uninstall set"
        onConfirm={() => {
          if (uninstalling) uninstallMutation.mutate(uninstalling.prefix);
          setUninstalling(null);
        }}
      />
    </>
  );
};

export default InstalledSets;
