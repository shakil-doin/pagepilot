"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DownloadSimple } from "@phosphor-icons/react";
import { api, ApiClientError } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { IconSetRow } from "@/components/studio/icons/installed-sets";

type CatalogEntry = {
  name: string;
  total: number;
  category?: string;
  author?: { name?: string };
};

const CatalogBrowser = () => {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  // The install endpoint downloads whole collections, so only one runs at a time
  const [installingPrefix, setInstallingPrefix] = useState<string | null>(null);

  const { data: catalog, isLoading } = useQuery({
    queryKey: ["icon-catalog"],
    queryFn: () => api.get<Record<string, CatalogEntry>>("/api/studio/icons/catalog"),
  });

  const { data: installedSets } = useQuery({
    queryKey: ["icon-sets"],
    queryFn: () => api.get<IconSetRow[]>("/api/studio/icon-sets"),
  });

  const installed = useMemo(() => new Set((installedSets ?? []).map((set) => set.prefix)), [installedSets]);

  const installMutation = useMutation({
    mutationFn: (prefix: string) => api.post<{ prefix: string; name: string; icons: number }>("/api/studio/icon-sets", { prefix }),
    onSuccess: (set) => {
      toast.success(`Installed ${set.name} with ${set.icons} icons`);
      queryClient.invalidateQueries({ queryKey: ["icon-sets"] });
      queryClient.invalidateQueries({ queryKey: ["icon-search"] });
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Install failed"),
    onSettled: () => setInstallingPrefix(null),
  });

  const rows = useMemo(() => {
    const all = Object.entries(catalog ?? {});
    const q = query.trim().toLowerCase();
    const filtered = q
      ? all.filter(([prefix, entry]) => prefix.includes(q) || entry.name.toLowerCase().includes(q))
      : all;
    return filtered.sort(([a], [b]) => a.localeCompare(b));
  }, [catalog, query]);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search collections by name or prefix…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-xs"
      />

      {isLoading ? (
        <p className="py-16 text-center text-sm text-muted">Loading the Iconify catalog…</p>
      ) : rows.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted">No collections match your search.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-hairline bg-surface">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Collection</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Icons</TableHead>
                <TableHead className="w-28" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(([prefix, entry]) => {
                const isInstalled = installed.has(prefix);
                const isInstalling = installingPrefix === prefix;
                return (
                  <TableRow key={prefix}>
                    <TableCell>
                      <span className="block text-sm font-medium text-ink">{entry.name}</span>
                      <span className="font-mono text-xs text-muted">{prefix}</span>
                    </TableCell>
                    <TableCell className="text-xs text-muted">{entry.category ?? "-"}</TableCell>
                    <TableCell className="text-xs text-muted">{entry.total.toLocaleString()}</TableCell>
                    <TableCell>
                      {isInstalled ? (
                        <Badge variant="success">Installed</Badge>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={installingPrefix !== null}
                          onClick={() => {
                            setInstallingPrefix(prefix);
                            installMutation.mutate(prefix);
                          }}
                        >
                          {isInstalling ? (
                            <>
                              <Spinner size="sm" />
                              Installing…
                            </>
                          ) : (
                            <>
                              <DownloadSimple size={14} />
                              Install
                            </>
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default CatalogBrowser;
