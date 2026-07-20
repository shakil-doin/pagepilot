"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type LinkValue = { href?: string; newTab?: boolean };

type Props = {
  value: unknown;
  onChange: (value: unknown) => void;
};

// Internal page picker + free URL/anchor input in one control.
const LinkControl = ({ value, onChange }: Props) => {
  const link = (value ?? {}) as LinkValue;
  const { data } = useQuery({
    queryKey: ["palette-pages"],
    queryFn: () => api.get<{ pages: { id: string; path: string; title: string }[] }>("/api/studio/pages"),
    staleTime: 60_000,
  });

  const knownPage = (data?.pages ?? []).find((page) => page.path === link.href);

  return (
    <div className="space-y-1.5">
      <Select
        value={knownPage ? knownPage.path : link.href ? "__custom" : undefined}
        onValueChange={(v) => {
          if (v !== "__custom") onChange({ ...link, href: v });
        }}
      >
        <SelectTrigger className="h-8 text-xs">
          <SelectValue placeholder="Pick a page…" />
        </SelectTrigger>
        <SelectContent>
          {(data?.pages ?? []).map((page) => (
            <SelectItem key={page.id} value={page.path} className="text-xs">
              {page.title} <span className="font-mono text-muted">{page.path}</span>
            </SelectItem>
          ))}
          <SelectItem value="__custom" className="text-xs">
            Custom URL or #anchor…
          </SelectItem>
        </SelectContent>
      </Select>
      <Input
        value={link.href ?? ""}
        placeholder="/pricing, https://example.com or #features"
        onChange={(e) => onChange({ ...link, href: e.target.value })}
        className="h-8 font-mono text-xs"
      />
      <label className="flex items-center justify-between text-xs text-body">
        Open in new tab
        <Switch checked={Boolean(link.newTab)} onCheckedChange={(checked) => onChange({ ...link, newTab: checked })} />
      </label>
    </div>
  );
};

export default LinkControl;
