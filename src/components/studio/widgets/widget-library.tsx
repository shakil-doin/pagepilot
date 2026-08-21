"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { api } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import WidgetPreview, { WidgetPreviewTheme } from "@/components/studio/shared/widget-preview";
import { cn } from "@/lib/utils";
import type { WidgetManifestEntry } from "@/types";

export type ManifestResponse = {
  manifest: WidgetManifestEntry[];
  themeCss?: string;
  fontClass?: string;
};

const CATEGORY_ORDER = ["Basic", "Layout", "Content", "Marketing", "Hero", "Process", "Proof", "Compare", "Pricing", "Education"] as const;

const WidgetLibrary = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["widget-manifest"],
    queryFn: () => api.get<ManifestResponse>("/api/studio/widgets/manifest"),
  });

  const entries = useMemo(() => data?.manifest ?? [], [data]);

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matches = entries.filter(
      (entry) =>
        (!category || entry.meta.category === category) &&
        (!needle ||
          entry.meta.name.toLowerCase().includes(needle) ||
          entry.meta.key.includes(needle) ||
          entry.meta.description.toLowerCase().includes(needle)),
    );

    const byCategory = new Map<string, WidgetManifestEntry[]>();
    for (const entry of matches) {
      const list = byCategory.get(entry.meta.category) ?? [];
      list.push(entry);
      byCategory.set(entry.meta.category, list);
    }
    return CATEGORY_ORDER.filter((name) => byCategory.has(name)).map((name) => ({
      category: name,
      entries: byCategory.get(name) ?? [],
    }));
  }, [entries, query, category]);

  const availableCategories = useMemo(
    () => CATEGORY_ORDER.filter((name) => entries.some((entry) => entry.meta.category === name)),
    [entries],
  );

  if (isLoading) return <p className="py-16 text-center text-sm text-muted">Loading widget library…</p>;

  const total = groups.reduce((sum, group) => sum + group.entries.length, 0);

  return (
    <div className="space-y-5">
      <WidgetPreviewTheme themeCss={data?.themeCss} />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <MagnifyingGlass size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search widgets…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 pl-8 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={cn(
              "studio-focus rounded-full border border-hairline px-3 py-1 text-xs",
              category === null ? "border-brand/50 bg-brand-soft/50 text-brand" : "text-muted hover:text-ink",
            )}
          >
            All
          </button>
          {availableCategories.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setCategory(name === category ? null : name)}
              className={cn(
                "studio-focus rounded-full border border-hairline px-3 py-1 text-xs",
                category === name ? "border-brand/50 bg-brand-soft/50 text-brand" : "text-muted hover:text-ink",
              )}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {groups.map((group) => (
        <div key={group.category}>
          <h3 className="mb-2 text-sm font-semibold text-ink">{group.category}</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.entries.map((entry) => (
              <div
                key={entry.meta.key}
                className="overflow-hidden rounded-xl border border-hairline bg-surface transition-colors hover:border-brand/40"
              >
                <WidgetPreview
                  type={entry.meta.key}
                  props={entry.defaults}
                  fontClass={data?.fontClass}
                  aspect="16 / 10"
                  className="rounded-none border-0 border-b border-hairline"
                />
                <div className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-ink">{entry.meta.name}</p>
                    {entry.meta.adminOnly ? <Badge variant="warning">Admin only</Badge> : null}
                  </div>
                  <p className="truncate font-mono text-[11px] text-muted">{entry.meta.key}</p>
                  <p className="mt-1.5 text-xs leading-snug text-body">{entry.meta.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {total === 0 ? (
        <p className="py-12 text-center text-sm text-muted">No widgets match that search.</p>
      ) : (
        <p className="text-xs text-muted">
          {total} widget{total === 1 ? "" : "s"}. Previews render the real widget with its starting content; add them to a
          page from the builder.
        </p>
      )}
    </div>
  );
};

export default WidgetLibrary;
