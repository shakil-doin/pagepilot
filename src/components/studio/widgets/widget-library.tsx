"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { WidgetManifestEntry } from "@/types";

export type ManifestResponse = { manifest: WidgetManifestEntry[] };

const CATEGORY_ORDER = ["Basic", "Content", "Marketing", "Layout"] as const;

const WidgetLibrary = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["widget-manifest"],
    queryFn: () => api.get<ManifestResponse>("/api/studio/widgets/manifest"),
  });

  const groups = useMemo(() => {
    const byCategory = new Map<string, WidgetManifestEntry[]>();
    for (const entry of data?.manifest ?? []) {
      const list = byCategory.get(entry.meta.category) ?? [];
      list.push(entry);
      byCategory.set(entry.meta.category, list);
    }
    return CATEGORY_ORDER.filter((category) => byCategory.has(category)).map((category) => ({
      category,
      entries: byCategory.get(category) ?? [],
    }));
  }, [data]);

  if (isLoading) return <p className="py-16 text-center text-sm text-muted">Loading widget library…</p>;

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.category}>
          <h3 className="mb-2 text-sm font-semibold text-ink">{group.category}</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.entries.map((entry) => (
              <Card key={entry.meta.key}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-ink">{entry.meta.name}</p>
                    {entry.meta.adminOnly ? <Badge variant="warning">Admin only</Badge> : null}
                  </div>
                  <p className="font-mono text-xs text-muted">{entry.meta.key}</p>
                  <p className="mt-2 text-xs text-body">{entry.meta.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
      <p className="text-xs text-muted">
        Widgets are added to pages from the builder. This library is a reference of what is available.
      </p>
    </div>
  );
};

export default WidgetLibrary;
