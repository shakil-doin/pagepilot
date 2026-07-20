"use client";

import { Warning } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import type { ThemeTokens } from "@/types";
import { AA_THRESHOLD, contrastRatio } from "@/components/studio/theme/contrast";

type Props = {
  tokens: ThemeTokens;
};

const PAIRS: { fg: string; bg: string; label: string }[] = [
  { fg: "text", bg: "background", label: "Heading text on background" },
  { fg: "textMuted", bg: "background", label: "Body text on background" },
  { fg: "primary", bg: "background", label: "Primary on background" },
];

const ContrastChecker = ({ tokens }: Props) => (
  <div className="rounded-xl border border-hairline bg-surface p-4">
    <p className="text-sm font-medium text-ink">Contrast check</p>
    <p className="mt-0.5 text-xs text-muted">WCAG AA needs at least {AA_THRESHOLD}:1 for normal text.</p>
    <div className="mt-3 space-y-2">
      {PAIRS.map((pair) => {
        const fg = tokens.colors[pair.fg]?.value;
        const bg = tokens.colors[pair.bg]?.value;
        if (!fg || !bg) return null;
        const ratio = contrastRatio(fg, bg);
        return (
          <div key={`${pair.fg}-${pair.bg}`} className="flex items-center gap-2 text-sm">
            <span
              className="flex h-7 w-12 shrink-0 items-center justify-center rounded-md border border-hairline text-xs font-semibold"
              style={{ background: bg, color: fg }}
              aria-hidden
            >
              Aa
            </span>
            <span className="min-w-0 flex-1 truncate text-body">{pair.label}</span>
            {ratio === null ? (
              <Badge variant="outline">not checkable</Badge>
            ) : ratio < AA_THRESHOLD ? (
              <Badge variant="warning">
                <Warning size={11} />
                AA fail · {ratio.toFixed(2)}:1
              </Badge>
            ) : (
              <Badge variant="success">{ratio.toFixed(2)}:1</Badge>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

export default ContrastChecker;
