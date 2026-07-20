"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ThemeTokens } from "@/types";
import { resolveTokenColor } from "@/components/studio/theme/theme-lib";

type Props = {
  label: string;
  colors: ThemeTokens["colors"];
  value: string | undefined;
  // Border slots may be cleared entirely.
  allowNone?: boolean;
  onChange: (value: string | undefined) => void;
};

const CUSTOM = "__custom__";
const NONE = "__none__";

const TokenColorField = ({ label, colors, value, allowNone = false, onChange }: Props) => {
  const isToken = value !== undefined && colors[value] !== undefined;
  const selectValue = value === undefined ? NONE : isToken ? value : CUSTOM;
  const resolved = resolveTokenColor({ colors } as ThemeTokens, value);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <span
          className="h-8 w-8 shrink-0 rounded-md border border-hairline"
          style={{ background: resolved ?? "transparent" }}
          aria-hidden
        />
        <Select
          value={selectValue}
          onValueChange={(next) => {
            if (next === NONE) onChange(undefined);
            else if (next === CUSTOM) onChange(resolved ?? "#000000");
            else onChange(next);
          }}
        >
          <SelectTrigger className="h-8 flex-1 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {allowNone ? <SelectItem value={NONE}>None</SelectItem> : null}
            {Object.entries(colors).map(([key, token]) => (
              <SelectItem key={key} value={key}>
                {token.label}
              </SelectItem>
            ))}
            <SelectItem value={CUSTOM}>Custom…</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {selectValue === CUSTOM ? (
        <Input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#3565F9 or transparent"
          className="h-8 font-mono text-xs"
          spellCheck={false}
        />
      ) : null}
    </div>
  );
};

export default TokenColorField;
