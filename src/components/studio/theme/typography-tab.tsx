"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SITE_FONT_NAMES } from "@/lib/fonts";
import type { ThemeTokens } from "@/types";

type Props = {
  tokens: ThemeTokens;
  onChange: (tokens: ThemeTokens) => void;
};

const WEIGHTS = [400, 500, 600, 700, 800];

const SCALE_LABELS: Record<string, string> = {
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  body: "Body",
};

const TypographyTab = ({ tokens, onChange }: Props) => {
  const setTypography = (patch: Partial<ThemeTokens["typography"]>) =>
    onChange({ ...tokens, typography: { ...tokens.typography, ...patch } });

  return (
    <div className="max-w-xl space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Heading font</Label>
          <Select value={tokens.typography.headingFont} onValueChange={(value) => setTypography({ headingFont: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SITE_FONT_NAMES.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Body font</Label>
          <Select value={tokens.typography.bodyFont} onValueChange={(value) => setTypography({ bodyFont: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SITE_FONT_NAMES.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Heading weight</Label>
        <Select
          value={String(tokens.typography.headingWeight)}
          onValueChange={(value) => setTypography({ headingWeight: Number(value) })}
        >
          <SelectTrigger className="sm:w-1/2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WEIGHTS.map((weight) => (
              <SelectItem key={weight} value={String(weight)}>
                {weight}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Type scale</Label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.entries(tokens.typography.scale).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <span className="text-xs text-muted">{SCALE_LABELS[key] ?? key}</span>
              <Input
                value={value}
                onChange={(e) =>
                  setTypography({ scale: { ...tokens.typography.scale, [key]: e.target.value } })
                }
                className="font-mono text-xs"
                placeholder="1rem"
                spellCheck={false}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted">Use rem values, for example 2.25rem.</p>
      </div>
    </div>
  );
};

export default TypographyTab;
