"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiClientError } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import ConfirmDialog from "@/components/studio/shared/confirm-dialog";
import type { GlobalWidgetRow } from "@/components/studio/widgets/global-widgets-tab";

type Props = {
  widgetId: string | null;
  onClose: () => void;
};

type PageRef = { id: string; path: string; title: string };
type DetailResponse = { widget: GlobalWidgetRow; affectedPages: PageRef[] };
type PatchResponse = { widget: GlobalWidgetRow; affected: PageRef[] };

const GlobalWidgetSheet = ({ widgetId, onClose }: Props) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [propsText, setPropsText] = useState("{}");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const { data } = useQuery({
    queryKey: ["global-widget", widgetId],
    queryFn: () => api.get<DetailResponse>(`/api/studio/widgets/global/${widgetId}`),
    enabled: widgetId !== null,
  });

  useEffect(() => {
    if (data) {
      setName(data.widget.name);
      setPropsText(JSON.stringify(data.widget.props, null, 2));
    }
  }, [data]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["global-widgets"] });
    queryClient.invalidateQueries({ queryKey: ["global-widget", widgetId] });
  };

  const saveMutation = useMutation({
    mutationFn: (props: Record<string, unknown>) =>
      api.patch<PatchResponse>(`/api/studio/widgets/global/${widgetId}`, { name, props }),
    onSuccess: (result) => {
      toast.success(`Saved. ${result.affected.length} page(s) revalidated.`);
      invalidate();
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.del(`/api/studio/widgets/global/${widgetId}`),
    onSuccess: () => {
      toast.success("Global widget deleted");
      queryClient.invalidateQueries({ queryKey: ["global-widgets"] });
      onClose();
    },
    // A 409 message lists the pages still using the widget
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Delete failed"),
  });

  const save = () => {
    let props: Record<string, unknown>;
    try {
      const parsed: unknown = JSON.parse(propsText);
      if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("not an object");
      }
      props = parsed as Record<string, unknown>;
    } catch {
      toast.error("Props must be a valid JSON object");
      return;
    }
    saveMutation.mutate(props);
  };

  return (
    <Sheet open={widgetId !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-120 max-w-full overflow-y-auto sm:w-130">
        {data ? (
          <>
            <SheetHeader>
              <SheetTitle>{data.widget.name}</SheetTitle>
              <SheetDescription className="font-mono text-xs">{data.widget.type}</SheetDescription>
            </SheetHeader>

            <div className="space-y-2">
              <Label htmlFor="global-name">Name</Label>
              <Input id="global-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="global-props">Props (JSON)</Label>
              <Textarea
                id="global-props"
                rows={12}
                className="font-mono text-xs"
                value={propsText}
                onChange={(e) => setPropsText(e.target.value)}
              />
              <p className="text-xs text-muted">
                Prefer editing content by selecting the widget on any page that uses it. This raw editor is the
                advanced path.
              </p>
            </div>

            <div className="flex justify-end">
              <Button disabled={saveMutation.isPending || !name} onClick={save}>
                {saveMutation.isPending ? "Saving…" : "Save changes"}
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Used on {data.affectedPages.length} page(s)</Label>
              {data.affectedPages.length === 0 ? (
                <p className="text-sm text-muted">Not placed on any published page yet.</p>
              ) : (
                <div className="divide-y divide-hairline rounded-lg border border-hairline">
                  {data.affectedPages.map((page) => (
                    <Link
                      key={page.id}
                      href={`/studio/pages/${page.id}/builder`}
                      className="block px-3 py-2 hover:bg-app"
                    >
                      <span className="block text-sm text-ink">{page.title}</span>
                      <span className="font-mono text-xs text-muted">{page.path}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button variant="destructive" size="sm" onClick={() => setDeleteConfirm(true)}>
                Delete widget
              </Button>
            </div>
          </>
        ) : (
          <p className="py-16 text-center text-sm text-muted">Loading widget…</p>
        )}
      </SheetContent>

      <ConfirmDialog
        open={deleteConfirm}
        onOpenChange={setDeleteConfirm}
        title={`Delete "${data?.widget.name}"?`}
        description="The widget is removed for good. Deleting fails while any published page still uses it."
        confirmLabel="Delete widget"
        onConfirm={() => {
          deleteMutation.mutate();
          setDeleteConfirm(false);
        }}
      />
    </Sheet>
  );
};

export default GlobalWidgetSheet;
