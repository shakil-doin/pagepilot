"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiClientError } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (id: string) => void;
};

const NewCustomWidgetDialog = ({ open, onOpenChange, onCreated }: Props) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const createMutation = useMutation({
    mutationFn: () => api.post<{ id: string }>("/api/studio/widgets/custom", { name, description, tree: [] }),
    onSuccess: (widget) => {
      toast.success("Custom widget created");
      queryClient.invalidateQueries({ queryKey: ["custom-widgets"] });
      setName("");
      setDescription("");
      onOpenChange(false);
      onCreated(widget.id);
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Create failed"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New custom widget</DialogTitle>
          <DialogDescription>A reusable composition of widgets, inserted on pages like any widget.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            createMutation.mutate();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="custom-widget-name">Name</Label>
            <Input
              id="custom-widget-name"
              placeholder="Feature trio"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="custom-widget-description">Description</Label>
            <Input
              id="custom-widget-description"
              placeholder="Three feature cards with icons"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || !name}>
              {createMutation.isPending ? "Creating…" : "Create and edit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewCustomWidgetDialog;
