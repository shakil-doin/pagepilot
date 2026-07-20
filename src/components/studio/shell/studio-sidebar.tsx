"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  SquaresFour,
  Files,
  Article,
  Image as ImageIcon,
  PuzzlePiece,
  PaintBrush,
  ListDashes,
  MagnifyingGlass,
  Smiley,
  Users,
  Gear,
  SignOut,
  Moon,
  Sun,
  CaretDoubleLeft,
  CaretDoubleRight,
} from "@phosphor-icons/react";
import { can } from "@/modules/auth/permissions";
import { useStudioTheme } from "@/providers/studio-providers";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Role } from "@/generated/prisma/enums";

type Props = {
  role: Role;
  userName: string;
};

const NAV = [
  { href: "/studio", label: "Dashboard", icon: SquaresFour, exact: true },
  { href: "/studio/pages", label: "Pages", icon: Files },
  { href: "/studio/blog", label: "Blog", icon: Article },
  { href: "/studio/media", label: "Media", icon: ImageIcon },
  { href: "/studio/widgets", label: "Widgets", icon: PuzzlePiece, capability: "widgets.global" as const },
  { href: "/studio/theme", label: "Theme", icon: PaintBrush, capability: "theme.manage" as const },
  { href: "/studio/navigation", label: "Navigation", icon: ListDashes, capability: "navigation.manage" as const },
  { href: "/studio/seo", label: "SEO", icon: MagnifyingGlass, capability: "seo.manage" as const },
  { href: "/studio/icons", label: "Icons", icon: Smiley, capability: "icons.install" as const },
  { href: "/studio/users", label: "Users", icon: Users, capability: "users.manage" as const },
  { href: "/studio/settings", label: "Settings", icon: Gear, capability: "settings.manage" as const },
];

const StudioSidebar = ({ role, userName }: Props) => {
  const pathname = usePathname();
  const { theme, toggle } = useStudioTheme();

  // Theme is resolved from localStorage on the client only; the icon it drives
  // must not differ between server and first client render (hydration). Render
  // a stable icon until mounted, then the real one.
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    setMounted(true);
    setCollapsed(localStorage.getItem("pp-sidebar") === "closed");
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      const next = !value;
      localStorage.setItem("pp-sidebar", next ? "closed" : "open");
      return next;
    });
  };

  const items = NAV.filter((item) => !item.capability || can(role, item.capability));

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r border-hairline bg-surface transition-[width] duration-150",
        collapsed ? "w-14" : "w-56",
      )}
    >
      <div className={cn("flex h-14 items-center border-b border-hairline", collapsed ? "justify-center px-0" : "gap-2 px-4")}>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
          P
        </div>
        {!collapsed ? <span className="flex-1 text-sm font-semibold text-ink">PagePilot</span> : null}
        {!collapsed ? (
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label="Collapse sidebar"
            className="studio-focus rounded-md p-1 text-muted hover:bg-app hover:text-ink"
          >
            <CaretDoubleLeft size={14} />
          </button>
        ) : null}
      </div>

      {collapsed ? (
        <div className="flex justify-center border-b border-hairline py-1.5">
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label="Expand sidebar"
            className="studio-focus rounded-md p-1.5 text-muted hover:bg-app hover:text-ink"
          >
            <CaretDoubleRight size={14} />
          </button>
        </div>
      ) : null}

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {items.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          const link = (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={cn(
                "flex items-center rounded-lg py-2 text-sm font-medium transition-colors",
                collapsed ? "justify-center px-0" : "gap-2.5 px-3",
                active ? "bg-brand-soft text-brand" : "text-body hover:bg-app hover:text-ink",
              )}
            >
              <Icon size={17} weight={active ? "fill" : "regular"} />
              {!collapsed ? item.label : null}
            </Link>
          );
          return collapsed ? (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ) : (
            link
          );
        })}
      </nav>

      <div className="border-t border-hairline p-2">
        <div className={cn("flex items-center py-1.5", collapsed ? "flex-col gap-1" : "justify-between px-2")}>
          {!collapsed ? (
            <span className="truncate text-xs text-muted" title={userName}>
              {userName}
            </span>
          ) : null}
          <div className={cn("flex items-center gap-1", collapsed && "flex-col")}>
            <button
              type="button"
              onClick={toggle}
              className="studio-focus rounded-md p-1.5 text-muted hover:bg-app hover:text-ink"
              aria-label="Toggle dark mode"
            >
              {mounted && theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="studio-focus rounded-md p-1.5 text-muted hover:bg-app hover:text-ink"
              aria-label="Sign out"
            >
              <SignOut size={15} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default StudioSidebar;
