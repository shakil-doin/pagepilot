"use client";

import { usePathname } from "next/navigation";
import { MagnifyingGlass } from "@phosphor-icons/react";

const TITLES: [string, string][] = [
  ["/studio/pages", "Pages"],
  ["/studio/blog", "Blog"],
  ["/studio/media", "Media"],
  ["/studio/widgets", "Widgets"],
  ["/studio/theme", "Theme"],
  ["/studio/navigation", "Navigation"],
  ["/studio/seo", "SEO"],
  ["/studio/icons", "Icons"],
  ["/studio/users", "Users"],
  ["/studio/settings", "Settings"],
];

const StudioTopbar = () => {
  const pathname = usePathname();
  const title = TITLES.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? "Dashboard";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-hairline bg-surface px-5">
      <h1 className="text-sm font-semibold text-ink">{title}</h1>
      <button
        type="button"
        onClick={() => document.dispatchEvent(new CustomEvent("pp-command-palette"))}
        className="studio-focus flex items-center gap-2 rounded-lg border border-hairline bg-app px-3 py-1.5 text-xs text-muted hover:text-ink"
      >
        <MagnifyingGlass size={13} />
        Search or jump to…
        <kbd className="rounded border border-hairline bg-surface px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
      </button>
    </header>
  );
};

export default StudioTopbar;
