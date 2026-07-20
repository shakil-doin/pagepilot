"use client";

import { useEffect, useState } from "react";
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

type Props = {
  widgetId: string | null;
  onClose: () => void;
};

type CustomWidgetDetail = {
  id: string;
  name: string;
  description: string | null;
  tree: unknown;
  exposedProps: unknown;
  updatedAt: string;
};

const CustomWidgetSheet = ({ widgetId, onClose }: Props) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [treeText, setTreeText] = useState("[]");
  const [exposedText, setExposedText] = useState("[]");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const { data: widget } = useQuery({
    queryKey: ["custom-widget", widgetId],
    queryFn: () => api.get<CustomWidgetDetail>(`/api/studio/widgets/custom/${widgetId}`),
    enabled: widgetId !== null,
  });

  useEffect(() => {
    if (widget) {
      setName(widget.name);
      setDescription(widget.description ?? "");
      setTreeText(JSON.stringify(widget.tree ?? [], null, 2));
      setExposedText(JSON.stringify(widget.exposedProps ?? [], null, 2));
    }
  }, [widget]);

  const saveMutation = useMutation({
    mutationFn: (body: { tree: unknown[]; exposedProps: unknown }) =>
      api.patch(`/api/studio/widgets/custom/${widgetId}`, { name, description, ...body }),
    onSuccess: () => {
      toast.success("Custom widget saved");
      queryClient.invalidateQueries({ queryKey: ["custom-widgets"] });
      queryClient.invalidateQueries({ queryKey: ["custom-widget", widgetId] });
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.del(`/api/studio/widgets/custom/${widgetId}`),
    onSuccess: () => {
      toast.success("Custom widget deleted");
      queryClient.invalidateQueries({ queryKey: ["custom-widgets"] });
      onClose();
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Delete failed"),
  });

  const save = () => {
    let tree: unknown[];
    let exposedProps: unknown;
    try {
      const parsedTree: unknown = JSON.parse(treeText);
      if (!Array.isArray(parsedTree)) throw new Error("not an array");
      tree = parsedTree;
    } catch {
      toast.error("Tree must be a valid JSON array");
      return;
    }
    try {
      exposedProps = exposedText.trim() ? JSON.parse(exposedText) : undefined;
    } catch {
      toast.error("Exposed props must be valid JSON");
      return;
    }
    saveMutation.mutate({ tree, exposedProps });
  };

  return (
    <Sheet open={widgetId !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-120 max-w-full overflow-y-auto sm:w-130">
        {widget ? (
          <>
            <SheetHeader>
              <SheetTitle>{widget.name}</SheetTitle>
              <SheetDescription>Custom widget</SheetDescription>
            </SheetHeader>

            <p className="rounded-lg bg-info/10 px-3 py-2 text-xs text-info">
              Compose custom widgets visually by saving a selection from the page builder in a future update; JSON
              editing is the current advanced path.
            </p>

            <div className="space-y-1.5">
              <Label htmlFor="custom-name">Name</Label>
              <Input id="custom-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="custom-description">Description</Label>
              <Input id="custom-description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="custom-tree">Tree (JSON)</Label>
              <Textarea
                id="custom-tree"
                rows={10}
                className="font-mono text-xs"
                value={treeText}
                onChange={(e) => setTreeText(e.target.value)}
              />
              <p className="text-xs text-muted">An array of section nodes, same shape as a page revision.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="custom-exposed">Exposed props (JSON)</Label>
              <Textarea
                id="custom-exposed"
                rows={5}
                className="font-mono text-xs"
                value={exposedText}
                onChange={(e) => setExposedText(e.target.value)}
              />
              <p className="text-xs text-muted">
                Fields shown in the inspector when instances are placed, e.g. {"[{ key, label, type, target }]"}.
              </p>
            </div>

            <div className="flex justify-end">
              <Button disabled={saveMutation.isPending || !name} onClick={save}>
                {saveMutation.isPending ? "Saving…" : "Save changes"}
              </Button>
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
        title={`Delete "${widget?.name}"?`}
        description="This removes the widget for good. Pages that still reference it will render without it."
        confirmLabel="Delete widget"
        onConfirm={() => {
          deleteMutation.mutate();
          setDeleteConfirm(false);
        }}
      />
    </Sheet>
  );
};

export default CustomWidgetSheet;
