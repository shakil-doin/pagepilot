"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MenuEditor from "@/components/studio/navigation/menu-editor";
import type { MenuItem } from "@/types";

type MenuRow = { id: string; slot: string; items: MenuItem[] };
type PageRow = { id: string; path: string; title: string };

const PATHS_DATALIST_ID = "pp-page-paths";
const SLOTS = [
  { slot: "header", label: "Header" },
  { slot: "footer", label: "Footer" },
];

const NavigationScreen = () => {
  const { data: menus, isLoading } = useQuery({
    queryKey: ["menus"],
    queryFn: () => api.get<MenuRow[]>("/api/studio/menus"),
  });

  const { data: pagesData } = useQuery({
    queryKey: ["pages", ""],
    queryFn: () => api.get<{ pages: PageRow[]; total: number }>("/api/studio/pages?query="),
  });

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-ink">Navigation</h2>
        <p className="text-sm text-muted">Edit the menus rendered in the site header and footer.</p>
      </div>

      <datalist id={PATHS_DATALIST_ID}>
        {(pagesData?.pages ?? []).map((page) => (
          <option key={page.id} value={page.path}>
            {page.title}
          </option>
        ))}
      </datalist>

      {isLoading ? (
        <p className="py-16 text-center text-sm text-muted">Loading menus…</p>
      ) : (
        <Tabs defaultValue="header">
          <TabsList>
            {SLOTS.map(({ slot, label }) => (
              <TabsTrigger key={slot} value={slot}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
          {SLOTS.map(({ slot, label }) => (
            <TabsContent key={slot} value={slot}>
              <MenuEditor
                slot={slot}
                slotLabel={label}
                initialItems={menus?.find((menu) => menu.slot === slot)?.items ?? []}
                pathsDatalistId={PATHS_DATALIST_ID}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default NavigationScreen;
