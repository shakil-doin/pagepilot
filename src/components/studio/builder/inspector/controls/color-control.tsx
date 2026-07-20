"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { ThemeTokens } from "@/types";

type Props = {
  value: unknown;
  onChange: (value: unknown) => void;
};

// Token-aware picker: theme tokens first, raw hex as the explicit escape
// hatch, so a rebrand stays one-screen work.
const ColorControl = ({ value, onChange }: Props) => {
  const { data } = useQuery({
    queryKey: ["theme-tokens"],
    queryFn: () => api.get<{ themes: { active: boolean; tokens: ThemeTokens }[]; defaultTokens: ThemeTokens }>("/api/studio/theme"),
    staleTime: 60_000,
  });
  const tokens = data?.themes.find((theme) => theme.active)?.tokens ?? data?.defaultTokens;
  const colors = tokens?.colors ?? {};
  const isToken = typeof value === "string" && value in colors;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="studio-focus flex h-8 w-full items-center gap-2 rounded-lg border border-hairline bg-surface px-2 text-xs"
        >
          <span
            className="h-4 w-4 shrink-0 rounded border border-hairline"
            style={{ background: isToken ? colors[value as string].value : String(value ?? "#ffffff") }}
          />
          <span className="truncate text-body">{isToken ? colors[value as string].label : String(value ?? "Pick a color")}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2">
        <p className="px-1 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">Theme tokens</p>
        <div className="grid grid-cols-5 gap-1.5 pb-2">
          {Object.entries(colors).map(([key, token]) => (
            <button
              key={key}
              type="button"
              title={token.label}
              onClick={() => onChange(key)}
              className={cn(
                "studio-focus h-7 w-7 rounded-md border",
                value === key ? "border-brand ring-2 ring-brand/40" : "border-hairline",
              )}
              style={{ background: token.value }}
            />
          ))}
        </div>
        <p className="px-1 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">Custom</p>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={isToken ? colors[value as string].value : String(value ?? "#000000")}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 w-10 cursor-pointer rounded border border-hairline bg-transparent"
            aria-label="Custom color"
          />
          <Input
            value={isToken ? "" : String(value ?? "")}
            placeholder="#0F172A"
            onChange={(e) => onChange(e.target.value)}
            className="h-8 font-mono text-xs"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColorControl;
