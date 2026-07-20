"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Props = {
  tokenKey: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

const isHex = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value) || /^#[0-9a-fA-F]{3}$/.test(value);

const ColorTokenCard = ({ tokenKey, label, value, onChange }: Props) => (
  <Popover>
    <PopoverTrigger asChild>
      <button
        type="button"
        className="group flex w-full items-center gap-3 rounded-xl border border-hairline bg-surface p-3 text-left transition-colors hover:border-brand/50"
      >
        <span
          className="h-10 w-10 shrink-0 rounded-lg border border-hairline"
          style={{ background: value }}
          aria-hidden
        />
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-ink">{label}</span>
          <span className="block font-mono text-xs text-muted uppercase">{value}</span>
        </span>
      </button>
    </PopoverTrigger>
    <PopoverContent align="start" className="w-56 space-y-3">
      <div className="space-y-2">
        <Label htmlFor={`token-picker-${tokenKey}`}>{label}</Label>
        <input
          id={`token-picker-${tokenKey}`}
          type="color"
          // Native color inputs only accept 6-digit hex; fall back to black for other values.
          value={isHex(value) ? (value.length === 4 ? `#${[...value.slice(1)].map((c) => c + c).join("")}` : value) : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full cursor-pointer rounded-md border border-hairline bg-surface"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`token-hex-${tokenKey}`}>Hex value</Label>
        <Input
          id={`token-hex-${tokenKey}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 font-mono text-xs"
          spellCheck={false}
        />
      </div>
    </PopoverContent>
  </Popover>
);

export default ColorTokenCard;
