"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiClientError } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ManifestResponse } from "@/components/studio/widgets/widget-library";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const NewGlobalWidgetDialog = ({ open, onOpenChange }: Props) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [type, setType] = useState("");

  const { data: manifestData } = useQuery({
    queryKey: ["widget-manifest"],
    queryFn: () => api.get<ManifestResponse>("/api/studio/widgets/manifest"),
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: () => {
      // New instances start from the manifest defaults for the chosen type
      const entry = (manifestData?.manifest ?? []).find((candidate) => candidate.meta.key === type);
      return api.post("/api/studio/widgets/global", { name, type, props: entry?.defaults ?? {} });
    },
    onSuccess: () => {
      toast.success("Global widget created");
      queryClient.invalidateQueries({ queryKey: ["global-widgets"] });
      setName("");
      setType("");
      onOpenChange(false);
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Create failed"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New global widget</DialogTitle>
          <DialogDescription>
            One shared instance you can place on many pages. Editing it updates every page that uses it.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            createMutation.mutate();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="global-widget-name">Name</Label>
            <Input
              id="global-widget-name"
              placeholder="Site-wide CTA"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label>Widget type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a widget…" />
              </SelectTrigger>
              <SelectContent>
                {(manifestData?.manifest ?? []).map((entry) => (
                  <SelectItem key={entry.meta.key} value={entry.meta.key}>
                    {entry.meta.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || !name || !type}>
              {createMutation.isPending ? "Creating…" : "Create widget"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewGlobalWidgetDialog;
