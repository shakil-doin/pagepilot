"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ThemeTokens } from "@/types";

type Props = {
  tokens: ThemeTokens;
  onChange: (tokens: ThemeTokens) => void;
};

const SPACING_LABELS: Record<string, string> = {
  sectionSm: "Section small",
  sectionMd: "Section medium",
  sectionLg: "Section large",
};

const FieldGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{children}</div>
);

const LayoutTab = ({ tokens, onChange }: Props) => (
  <div className="max-w-xl space-y-5">
    <div className="space-y-2">
      <Label>Container</Label>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <span className="text-xs text-muted">Max width</span>
          <Input
            value={tokens.container.maxWidth}
            onChange={(e) => onChange({ ...tokens, container: { ...tokens.container, maxWidth: e.target.value } })}
            className="font-mono text-xs"
            placeholder="1440px"
            spellCheck={false}
          />
        </div>
        <div className="space-y-1">
          <span className="text-xs text-muted">Gutter</span>
          <Input
            value={tokens.container.gutter}
            onChange={(e) => onChange({ ...tokens, container: { ...tokens.container, gutter: e.target.value } })}
            className="font-mono text-xs"
            placeholder="1rem"
            spellCheck={false}
          />
        </div>
      </div>
    </div>

    <div className="space-y-2">
      <Label>Corner radii</Label>
      <FieldGrid>
        {Object.entries(tokens.radii).map(([key, value]) => (
          <div key={key} className="space-y-1">
            <span className="text-xs text-muted uppercase">{key}</span>
            <Input
              value={value}
              onChange={(e) => onChange({ ...tokens, radii: { ...tokens.radii, [key]: e.target.value } })}
              className="font-mono text-xs"
              placeholder="0.5rem"
              spellCheck={false}
            />
          </div>
        ))}
      </FieldGrid>
    </div>

    <div className="space-y-2">
      <Label>Section spacing</Label>
      <FieldGrid>
        {Object.entries(tokens.spacing).map(([key, value]) => (
          <div key={key} className="space-y-1">
            <span className="text-xs text-muted">{SPACING_LABELS[key] ?? key}</span>
            <Input
              value={value}
              onChange={(e) => onChange({ ...tokens, spacing: { ...tokens.spacing, [key]: e.target.value } })}
              className="font-mono text-xs"
              placeholder="4rem"
              spellCheck={false}
            />
          </div>
        ))}
      </FieldGrid>
    </div>
  </div>
);

export default LayoutTab;
