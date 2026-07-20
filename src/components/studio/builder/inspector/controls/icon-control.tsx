"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type IconHit = { ref: string; body: string; width: number; height: number };

type Props = {
  value: unknown;
  onChange: (value: unknown) => void;
};

const IconPreview = ({ icon, size = 16 }: { icon: IconHit; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox={`0 0 ${icon.width} ${icon.height}`}
    fill="currentColor"
    aria-hidden
    dangerouslySetInnerHTML={{ __html: icon.body }}
  />
);

// Searches across every installed Iconify set (served from the database).
const IconControl = ({ value, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const { data: results } = useQuery({
    queryKey: ["icon-search", query],
    queryFn: () => api.get<IconHit[]>(`/api/studio/icons/search?q=${encodeURIComponent(query)}`),
    enabled: open,
  });

  const current = typeof value === "string" ? value : "";
  const currentHit = (results ?? []).find((icon) => icon.ref === current);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="studio-focus flex h-8 w-full items-center gap-2 rounded-lg border border-hairline bg-surface px-2 text-xs text-body"
        >
          {currentHit ? <IconPreview icon={currentHit} /> : null}
          <span className="truncate font-mono">{current || "Pick an icon…"}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <Input
          placeholder="Search icons…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-2 h-8 text-xs"
          autoFocus
        />
        <div className="grid max-h-52 grid-cols-6 gap-1 overflow-y-auto">
          {(results ?? []).map((icon) => (
            <button
              key={icon.ref}
              type="button"
              title={icon.ref}
              onClick={() => {
                onChange(icon.ref);
                setOpen(false);
              }}
              className={cn(
                "studio-focus flex h-8 w-8 items-center justify-center rounded-md text-body hover:bg-brand-soft hover:text-brand",
                value === icon.ref && "bg-brand-soft text-brand",
              )}
            >
              <IconPreview icon={icon} size={16} />
            </button>
          ))}
          {(results ?? []).length === 0 ? (
            <p className="col-span-6 py-6 text-center text-xs text-muted">
              No icons found. Install sets under Studio → Icons.
            </p>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default IconControl;
