"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "@phosphor-icons/react";
import { api } from "@/services/api";
import { timeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import NewCustomWidgetDialog from "@/components/studio/widgets/new-custom-widget-dialog";
import CustomWidgetSheet from "@/components/studio/widgets/custom-widget-sheet";

export type CustomWidgetRow = {
  id: string;
  name: string;
  description: string | null;
  thumbnail: string | null;
  exposedProps: unknown;
  updatedAt: string;
};

const CustomWidgetsTab = () => {
  const [newOpen, setNewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: widgets, isLoading } = useQuery({
    queryKey: ["custom-widgets"],
    queryFn: () => api.get<CustomWidgetRow[]>("/api/studio/widgets/custom"),
  });

  return (
    <div className="space-y-4">
      <p className="rounded-lg bg-info/10 px-3 py-2 text-xs text-info">
        Compose custom widgets visually by saving a selection from the page builder in a future update; JSON editing
        is the current advanced path.
      </p>

      <div className="flex justify-end">
        <Button onClick={() => setNewOpen(true)}>
          <Plus size={15} className="mr-1.5" />
          New custom widget
        </Button>
      </div>

      {isLoading ? (
        <p className="py-16 text-center text-sm text-muted">Loading custom widgets…</p>
      ) : (widgets ?? []).length === 0 ? (
        <div className="rounded-xl border border-dashed border-hairline py-16 text-center">
          <p className="text-sm font-medium text-ink">No custom widgets yet</p>
          <p className="mt-1 text-sm text-muted">Create one to reuse a composition of widgets across pages.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-hairline bg-surface">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(widgets ?? []).map((widget) => (
                <TableRow key={widget.id} className="cursor-pointer" onClick={() => setSelectedId(widget.id)}>
                  <TableCell className="text-sm font-medium text-ink">{widget.name}</TableCell>
                  <TableCell className="max-w-64 truncate text-xs text-muted">{widget.description ?? ""}</TableCell>
                  <TableCell className="text-xs text-muted">{timeAgo(widget.updatedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <NewCustomWidgetDialog open={newOpen} onOpenChange={setNewOpen} onCreated={setSelectedId} />
      <CustomWidgetSheet widgetId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
};

export default CustomWidgetsTab;
