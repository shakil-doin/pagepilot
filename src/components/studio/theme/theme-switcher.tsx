"use client";

import { useState } from "react";
import { CaretDown, Check } from "@phosphor-icons/react";
import { cn, timeAgo } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ThemeRow } from "@/components/studio/theme/theme-lib";

type Props = {
  themes: ThemeRow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

const ThemeSwitcher = ({ themes, selectedId, onSelect }: Props) => {
  const [open, setOpen] = useState(false);
  const selected = themes.find((theme) => theme.id === selectedId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="secondary" className="min-w-44 justify-between">
          <span className="flex items-center gap-2 truncate">
            {selected?.name ?? "Pick a theme"}
            {selected?.active ? <Badge variant="success">active</Badge> : null}
          </span>
          <CaretDown size={13} className="text-muted" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-1">
        {themes.map((theme) => (
          <button
            key={theme.id}
            type="button"
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-app",
              theme.id === selectedId && "bg-brand-soft",
            )}
            onClick={() => {
              onSelect(theme.id);
              setOpen(false);
            }}
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium text-ink">{theme.name}</span>
              <span className="block text-xs text-muted">Updated {timeAgo(theme.updatedAt)}</span>
            </span>
            {theme.active ? <Badge variant="success">active</Badge> : null}
            {theme.id === selectedId ? <Check size={14} className="shrink-0 text-brand" /> : null}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
};

export default ThemeSwitcher;
