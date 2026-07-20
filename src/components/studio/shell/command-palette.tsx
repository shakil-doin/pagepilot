"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { api } from "@/services/api";
import { can } from "@/modules/auth/permissions";
import type { Role } from "@/generated/prisma/enums";

type Props = { role: Role };

type PageRow = { id: string; path: string; title: string };

const CommandPalette = ({ role }: Props) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    document.addEventListener("pp-command-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pp-command-palette", onOpen);
    };
  }, []);

  const { data } = useQuery({
    queryKey: ["palette-pages"],
    queryFn: () => api.get<{ pages: PageRow[] }>("/api/studio/pages"),
    enabled: open,
  });

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Jump to a page or action…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Actions">
          {can(role, "pages.manage") ? (
            <CommandItem onSelect={() => go("/studio/pages?new=1")}>New page</CommandItem>
          ) : null}
          <CommandItem onSelect={() => go("/studio/blog?new=1")}>New blog post</CommandItem>
          <CommandItem onSelect={() => go("/studio/media")}>Open media library</CommandItem>
          {can(role, "theme.manage") ? <CommandItem onSelect={() => go("/studio/theme")}>Edit theme</CommandItem> : null}
          {can(role, "settings.manage") ? (
            <CommandItem onSelect={() => go("/studio/settings")}>Site settings</CommandItem>
          ) : null}
        </CommandGroup>
        <CommandGroup heading="Pages">
          {(data?.pages ?? []).map((page) => (
            <CommandItem key={page.id} onSelect={() => go(`/studio/pages/${page.id}/builder`)}>
              <span className="truncate">{page.title}</span>
              <span className="ml-2 font-mono text-xs text-muted">{page.path}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default CommandPalette;
