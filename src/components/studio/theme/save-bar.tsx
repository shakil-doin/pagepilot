"use client";

import { Button } from "@/components/ui/button";

type Props = {
  visible: boolean;
  isActiveTheme: boolean;
  saving: boolean;
  onDiscard: () => void;
  onSave: () => void;
};

// Sticky footer shown while the token draft differs from the saved theme.
const SaveBar = ({ visible, isActiveTheme, saving, onDiscard, onSave }: Props) => {
  if (!visible) return null;

  return (
    <div className="sticky bottom-0 z-10 flex items-center gap-3 border-t border-hairline bg-surface px-4 py-3 shadow-[0_-1px_6px_rgba(0,0,0,0.06)]">
      <p className="text-sm text-body">
        <span className="font-medium text-ink">Unsaved changes.</span>{" "}
        {isActiveTheme ? "Saving updates the live site instantly." : "This theme is not live, saving is safe."}
      </p>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onDiscard} disabled={saving}>
          Discard
        </Button>
        <Button size="sm" onClick={onSave} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
};

export default SaveBar;
