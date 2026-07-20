"use client";

import { useState } from "react";
import { ArrowsClockwise } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

// Live site preview. The iframe re-renders the real homepage, so it shows the
// last saved state of the active theme, not the local draft.
const PreviewPane = () => {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <div className="hidden w-2/5 shrink-0 flex-col border-l border-hairline bg-surface lg:flex">
      <div className="flex items-center gap-2 border-b border-hairline px-3 py-2">
        <p className="text-xs text-muted">Preview reflects the last save</p>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto h-7"
          onClick={() => setReloadKey((key) => key + 1)}
        >
          <ArrowsClockwise size={13} className="mr-1" />
          Reload
        </Button>
      </div>
      <iframe key={reloadKey} src="/" title="Site preview" className="min-h-0 flex-1 bg-white" />
    </div>
  );
};

export default PreviewPane;
