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

const NewPostDialog = ({ open, onOpenChange }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  const createMutation = useMutation({
    mutationFn: () => api.post<{ id: string }>("/api/studio/blog/posts", { title, slug: slug || undefined }),
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      onOpenChange(false);
      router.push(`/studio/blog/${post.id}`);
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Could not create the post"),
  });

  const onTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New post</DialogTitle>
          <DialogDescription>Give the post a title. You can change the slug later.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            createMutation.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="post-title">Title</Label>
            <Input
              id="post-title"
              placeholder="How we built PagePilot"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="post-slug">Slug</Label>
            <Input
              id="post-slug"
              placeholder="how-we-built-pagepilot"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              className="font-mono"
            />
            <p className="text-xs text-muted">The post will live at /blog/{slug || "…"}</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || !title}>
              {createMutation.isPending ? "Creating…" : "Create and open editor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewPostDialog;
