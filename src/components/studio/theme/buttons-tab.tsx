"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ThemeTokens } from "@/types";
import TokenColorField from "@/components/studio/theme/token-color-field";
import { resolveTokenColor } from "@/components/studio/theme/theme-lib";

type Props = {
  tokens: ThemeTokens;
  onChange: (tokens: ThemeTokens) => void;
};

type ButtonTokens = ThemeTokens["buttons"][string];

const RADII = ["sm", "md", "lg", "xl"];

const ButtonsTab = ({ tokens, onChange }: Props) => {
  const setVariant = (variant: string, patch: Partial<ButtonTokens>) => {
    const next = { ...tokens.buttons[variant], ...patch };
    // A removed border must not linger as an undefined key in the saved JSON.
    if (patch.border === undefined && "border" in patch) delete next.border;
    onChange({ ...tokens, buttons: { ...tokens.buttons, [variant]: next } });
  };

  return (
    <div className="grid max-w-4xl grid-cols-1 gap-4 lg:grid-cols-2">
      {Object.entries(tokens.buttons).map(([variant, button]) => (
        <div key={variant} className="space-y-4 rounded-xl border border-hairline bg-surface p-4">
          <p className="text-sm font-semibold text-ink capitalize">{variant} button</p>

          <TokenColorField
            label="Background"
            colors={tokens.colors}
            value={button.bg}
            onChange={(value) => setVariant(variant, { bg: value ?? "transparent" })}
          />
          <TokenColorField
            label="Text color"
            colors={tokens.colors}
            value={button.text}
            onChange={(value) => setVariant(variant, { text: value ?? "#000000" })}
          />
          <TokenColorField
            label="Border"
            colors={tokens.colors}
            value={button.border}
            allowNone
            onChange={(value) => setVariant(variant, { border: value })}
          />

          <div className="grid grid-cols-2 items-end gap-3">
            <div className="space-y-2">
              <Label>Radius</Label>
              <Select value={button.radius ?? "md"} onValueChange={(value) => setVariant(variant, { radius: value })}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RADII.map((radius) => (
                    <SelectItem key={radius} value={radius}>
                      {radius} ({tokens.radii[radius] ?? "?"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-2 pb-1.5 text-sm text-body">
              <Switch
                checked={button.shadow ?? false}
                onCheckedChange={(checked) => setVariant(variant, { shadow: checked })}
              />
              Shadow
            </label>
          </div>

          <div className="flex items-center justify-center rounded-lg border border-dashed border-hairline bg-app py-6">
            <span
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium"
              style={{
                background: resolveTokenColor(tokens, button.bg),
                color: resolveTokenColor(tokens, button.text),
                border: button.border ? `1px solid ${resolveTokenColor(tokens, button.border)}` : "1px solid transparent",
                borderRadius: tokens.radii[button.radius ?? "md"],
                boxShadow: button.shadow ? "0 1px 2px rgb(0 0 0 / 0.15)" : undefined,
              }}
            >
              {variant.charAt(0).toUpperCase() + variant.slice(1)} action
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ButtonsTab;
