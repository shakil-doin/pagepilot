"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "@phosphor-icons/react";
import { api } from "@/services/api";
import { timeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import NewGlobalWidgetDialog from "@/components/studio/widgets/new-global-widget-dialog";
import GlobalWidgetSheet from "@/components/studio/widgets/global-widget-sheet";

export type GlobalWidgetRow = {
  id: string;
  name: string;
  type: string;
  props: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

const GlobalWidgetsTab = () => {
  const [newOpen, setNewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: widgets, isLoading } = useQuery({
    queryKey: ["global-widgets"],
    queryFn: () => api.get<GlobalWidgetRow[]>("/api/studio/widgets/global"),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setNewOpen(true)}>
          <Plus size={15} className="mr-1.5" />
          New global widget
        </Button>
      </div>

      {isLoading ? (
        <p className="py-16 text-center text-sm text-muted">Loading global widgets…</p>
      ) : (widgets ?? []).length === 0 ? (
        <div className="rounded-xl border border-dashed border-hairline py-16 text-center">
          <p className="text-sm font-medium text-ink">No global widgets yet</p>
          <p className="mt-1 text-sm text-muted">
            A global widget is one shared instance. Edit it once and every page using it updates.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-hairline bg-surface">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(widgets ?? []).map((widget) => (
                <TableRow key={widget.id} className="cursor-pointer" onClick={() => setSelectedId(widget.id)}>
                  <TableCell className="text-sm font-medium text-ink">{widget.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted">{widget.type}</TableCell>
                  <TableCell className="text-xs text-muted">{timeAgo(widget.updatedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <NewGlobalWidgetDialog open={newOpen} onOpenChange={setNewOpen} />
      <GlobalWidgetSheet widgetId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
};

export default GlobalWidgetsTab;
