"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { IconSetRow } from "@/components/studio/icons/installed-sets";

type IconResult = {
  ref: string;
  body: string;
  width: number;
  height: number;
};

const ALL_SETS = "__all__";

const IconBrowser = () => {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [prefix, setPrefix] = useState(ALL_SETS);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: sets } = useQuery({
    queryKey: ["icon-sets"],
    queryFn: () => api.get<IconSetRow[]>("/api/studio/icon-sets"),
  });

  const { data: icons, isLoading } = useQuery({
    queryKey: ["icon-search", debounced, prefix],
    queryFn: () =>
      api.get<IconResult[]>(
        `/api/studio/icons/search?q=${encodeURIComponent(debounced)}${prefix === ALL_SETS ? "" : `&prefix=${encodeURIComponent(prefix)}`}`,
      ),
  });

  const copyRef = async (ref: string) => {
    await navigator.clipboard.writeText(ref);
    toast.success(`Copied ${ref}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search installed icons…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
        />
        <Select value={prefix} onValueChange={setPrefix}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_SETS}>All sets</SelectItem>
            {(sets ?? []).map((set) => (
              <SelectItem key={set.prefix} value={set.prefix}>
                {set.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="py-16 text-center text-sm text-muted">Searching icons…</p>
      ) : (icons ?? []).length === 0 ? (
        <div className="rounded-xl border border-dashed border-hairline py-16 text-center">
          <p className="text-sm font-medium text-ink">No icons found</p>
          <p className="mt-1 text-sm text-muted">
            {(sets ?? []).length === 0 ? "Install a set from the catalog first." : "Try a different search term."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(4.5rem,1fr))] gap-2">
          {(icons ?? []).map((icon) => (
            <button
              key={icon.ref}
              type="button"
              title={icon.ref}
              onClick={() => copyRef(icon.ref)}
              className="flex flex-col items-center gap-1.5 rounded-lg border border-hairline bg-surface p-3 text-ink transition-colors hover:border-brand/40 hover:text-brand"
            >
              <svg
                viewBox={`0 0 ${icon.width} ${icon.height}`}
                width={22}
                height={22}
                fill="currentColor"
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: icon.body }}
              />
              <span className="w-full truncate text-center text-[10px] text-muted">{icon.ref.split(":")[1]}</span>
            </button>
          ))}
        </div>
      )}
      <p className="text-xs text-muted">Click an icon to copy its reference for use in widgets and menus.</p>
    </div>
  );
};

export default IconBrowser;
