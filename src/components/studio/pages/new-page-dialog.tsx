"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiClientError } from "@/services/api";
import { slugify } from "@/lib/utils";
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
};

const NewPageDialog = ({ open, onOpenChange }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [path, setPath] = useState("");
  const [pathTouched, setPathTouched] = useState(false);

  const createMutation = useMutation({
    mutationFn: () => api.post<{ id: string }>("/api/studio/pages", { title, path: path || "/" }),
    onSuccess: (page) => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      onOpenChange(false);
      router.push(`/studio/pages/${page.id}/builder`);
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Could not create the page"),
  });

  const onTitleChange = (value: string) => {
    setTitle(value);
    if (!pathTouched) setPath(`/${slugify(value)}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New page</DialogTitle>
          <DialogDescription>Give the page a name and a URL path. You can change both later.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            createMutation.mutate();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="page-title">Title</Label>
            <Input
              id="page-title"
              placeholder="Pricing"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="page-path">Path</Label>
            <Input
              id="page-path"
              placeholder="/pricing"
              value={path}
              onChange={(e) => {
                setPathTouched(true);
                setPath(e.target.value);
              }}
              required
              className="font-mono"
            />
            <p className="text-xs text-muted">Use / for the homepage.</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || !title}>
              {createMutation.isPending ? "Creating…" : "Create and open builder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewPageDialog;
