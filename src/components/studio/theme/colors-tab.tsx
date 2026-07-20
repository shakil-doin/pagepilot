"use client";

import { useState } from "react";
import { Plus } from "@phosphor-icons/react";
import type { ThemeTokens } from "@/types";
import ColorTokenCard from "@/components/studio/theme/color-token-card";
import AddTokenDialog from "@/components/studio/theme/add-token-dialog";
import ContrastChecker from "@/components/studio/theme/contrast-checker";

type Props = {
  tokens: ThemeTokens;
  onChange: (tokens: ThemeTokens) => void;
};

const ColorsTab = ({ tokens, onChange }: Props) => {
  const [addOpen, setAddOpen] = useState(false);

  const setColor = (key: string, value: string) =>
    onChange({
      ...tokens,
      colors: { ...tokens.colors, [key]: { ...tokens.colors[key], value } },
    });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Object.entries(tokens.colors).map(([key, token]) => (
          <ColorTokenCard key={key} tokenKey={key} label={token.label} value={token.value} onChange={(value) => setColor(key, value)} />
        ))}
        <button
          type="button"
          className="flex min-h-16 items-center justify-center gap-1.5 rounded-xl border border-dashed border-hairline text-sm text-muted transition-colors hover:border-brand hover:text-brand"
          onClick={() => setAddOpen(true)}
        >
          <Plus size={14} />
          Add custom token
        </button>
      </div>

      <ContrastChecker tokens={tokens} />

      <AddTokenDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        existingKeys={Object.keys(tokens.colors)}
        onAdd={(key, label, value) =>
          onChange({ ...tokens, colors: { ...tokens.colors, [key]: { value, label } } })
        }
      />
    </div>
  );
};

export default ColorsTab;
