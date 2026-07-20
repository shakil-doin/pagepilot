"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Option = { label: string; value: string | number };

export const TextControl = ({ value, onChange, placeholder }: { value: unknown; onChange: (v: unknown) => void; placeholder?: string }) => (
  <Input value={String(value ?? "")} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="h-8 text-xs" />
);

export const TextareaControl = ({ value, onChange, placeholder }: { value: unknown; onChange: (v: unknown) => void; placeholder?: string }) => (
  <Textarea value={String(value ?? "")} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} rows={3} className="text-xs" />
);

export const NumberControl = ({
  value,
  onChange,
  min,
  max,
  step,
}: {
  value: unknown;
  onChange: (v: unknown) => void;
  min?: number;
  max?: number;
  step?: number;
}) => (
  <Input
    type="number"
    value={value === undefined || value === null ? "" : Number(value)}
    min={min}
    max={max}
    step={step}
    onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
    className="h-8 text-xs"
  />
);

export const SwitchControl = ({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) => (
  <Switch checked={Boolean(value)} onCheckedChange={onChange} />
);

export const SegmentedControl = ({
  value,
  onChange,
  options,
}: {
  value: unknown;
  onChange: (v: unknown) => void;
  options: Option[];
}) => (
  <div className="flex w-full rounded-lg bg-app p-0.5">
    {options.map((option) => (
      <button
        key={String(option.value)}
        type="button"
        onClick={() => onChange(option.value)}
        className={cn(
          "studio-focus flex-1 rounded-md px-2 py-1 text-xs font-medium capitalize",
          value === option.value ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink",
        )}
      >
        {option.label}
      </button>
    ))}
  </div>
);

export const SelectControl = ({
  value,
  onChange,
  options,
}: {
  value: unknown;
  onChange: (v: unknown) => void;
  options: Option[];
}) => {
  const isNumeric = options.length > 0 && typeof options[0].value === "number";
  return (
    <Select value={value === undefined ? undefined : String(value)} onValueChange={(v) => onChange(isNumeric ? Number(v) : v)}>
      <SelectTrigger className="h-8 text-xs">
        <SelectValue placeholder="Choose…" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={String(option.value)} value={String(option.value)} className="text-xs">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export const SliderControl = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
}: {
  value: unknown;
  onChange: (v: unknown) => void;
  min?: number;
  max?: number;
  step?: number;
}) => (
  <div className="flex items-center gap-2">
    <Slider value={[Number(value ?? min)]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)} className="flex-1" />
    <span className="w-8 text-right font-mono text-xs text-muted">{String(value ?? min)}</span>
  </div>
);

export const DateControl = ({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) => (
  <Input
    type="date"
    value={value ? String(value).slice(0, 10) : ""}
    onChange={(e) => onChange(e.target.value || undefined)}
    className="h-8 text-xs"
  />
);
