"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImageSquare, X } from "@phosphor-icons/react";
import { api, ApiClientError } from "@/services/api";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import ConfirmDialog from "@/components/studio/shared/confirm-dialog";
import MediaPickerDialog from "@/components/studio/media/media-picker-dialog";
import type { MediaRow } from "@/services/media";
import type { StudioPost } from "@/components/studio/blog/post-editor/post-types";

type TaxonomyRow = { id: string; name: string; slug: string };

const errMessage = (err: unknown, fallback: string) => (err instanceof ApiClientError ? err.message : fallback);

const PostSettingsPanel = ({ post }: { post: StudioPost }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [slug, setSlug] = useState(post.slug);
  const [excerpt, setExcerpt] = useState(post.excerpt ?? "");
  const [scheduleAt, setScheduleAt] = useState("");
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["post", post.id] });
    queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
  };

  const patchMutation = useMutation({
    mutationFn: (input: Record<string, unknown>) =>
      api.patch<{ slug: string; excerpt: string | null }>(`/api/studio/blog/posts/${post.id}`, input),
    onSuccess: (data) => {
      // Server may normalize the slug (slugify); reflect the stored values.
      setSlug(data.slug);
      setExcerpt(data.excerpt ?? "");
      invalidate();
    },
    onError: (err) => toast.error(errMessage(err, "Update failed")),
  });

  const lifecycleMutation = useMutation({
    mutationFn: ({ path, body }: { path: string; body?: unknown; message: string }) =>
      api.post(`/api/studio/blog/posts/${post.id}/${path}`, body),
    onSuccess: (_data, vars) => {
      toast.success(vars.message);
      invalidate();
    },
    onError: (err) => toast.error(errMessage(err, "Action failed")),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.del(`/api/studio/blog/posts/${post.id}`),
    onSuccess: () => {
      toast.success("Post deleted");
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      router.push("/studio/blog");
    },
    onError: (err) => toast.error(errMessage(err, "Delete failed")),
  });

  const categoriesQuery = useQuery({
    queryKey: ["blog-categories"],
    queryFn: () => api.get<TaxonomyRow[]>("/api/studio/blog/categories"),
  });
  const tagsQuery = useQuery({
    queryKey: ["blog-tags"],
    queryFn: () => api.get<TaxonomyRow[]>("/api/studio/blog/tags"),
  });

  const toggleTaxonomy = (field: "categoryIds" | "tagIds", selected: { id: string }[], id: string, checked: boolean) => {
    const ids = new Set(selected.map((item) => item.id));
    if (checked) ids.add(id);
    else ids.delete(id);
    patchMutation.mutate({ [field]: [...ids] });
  };

  const busy = lifecycleMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="space-y-2 rounded-lg border border-hairline p-3">
        {post.status === "SCHEDULED" && post.scheduledFor ? (
          <p className="text-xs text-info">Scheduled for {new Date(post.scheduledFor).toLocaleString()}</p>
        ) : null}
        {post.status === "PUBLISHED" && post.publishedAt ? (
          <p className="text-xs text-success">Published {formatDate(post.publishedAt)}</p>
        ) : null}

        {post.status !== "PUBLISHED" ? (
          <Button
            className="w-full"
            size="sm"
            disabled={busy}
            onClick={() => lifecycleMutation.mutate({ path: "publish", message: "Post published" })}
          >
            Publish now
          </Button>
        ) : null}

        {post.status === "DRAFT" || post.status === "ARCHIVED" ? (
          <div className="space-y-1.5">
            <Label htmlFor="post-schedule" className="text-xs">
              Schedule
            </Label>
            <div className="flex items-center gap-1.5">
              <Input
                id="post-schedule"
                type="datetime-local"
                value={scheduleAt}
                onChange={(e) => setScheduleAt(e.target.value)}
                className="h-8 text-xs"
              />
              <Button
                size="sm"
                variant="secondary"
                disabled={busy || !scheduleAt}
                onClick={() =>
                  lifecycleMutation.mutate({
                    path: "schedule",
                    body: { when: new Date(scheduleAt).toISOString() },
                    message: "Post scheduled",
                  })
                }
              >
                Set
              </Button>
            </div>
          </div>
        ) : null}

        {post.status === "PUBLISHED" || post.status === "SCHEDULED" ? (
          <Button
            className="w-full"
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() =>
              lifecycleMutation.mutate({
                path: "unpublish",
                body: { archive: false },
                message: post.status === "SCHEDULED" ? "Schedule cancelled" : "Post unpublished",
              })
            }
          >
            {post.status === "SCHEDULED" ? "Cancel schedule" : "Unpublish"}
          </Button>
        ) : null}

        {post.status !== "ARCHIVED" ? (
          <Button
            className="w-full"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => lifecycleMutation.mutate({ path: "unpublish", body: { archive: true }, message: "Post archived" })}
          >
            Archive
          </Button>
        ) : null}

        {post.status === "PUBLISHED" ? (
          <Button className="w-full" size="sm" variant="ghost" asChild>
            <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer">
              View live post
            </a>
          </Button>
        ) : null}

        <Button className="w-full" size="sm" variant="destructive" onClick={() => setDeleteOpen(true)}>
          Delete post
        </Button>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="post-slug-input">Slug</Label>
        <Input
          id="post-slug-input"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          onBlur={() => {
            if (slug.trim() && slug !== post.slug) patchMutation.mutate({ slug });
          }}
          className="font-mono text-xs"
        />
        <p className="text-xs text-muted">/blog/{slug || "…"}</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="post-excerpt">Excerpt</Label>
        <Textarea
          id="post-excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          onBlur={() => {
            if (excerpt !== (post.excerpt ?? "")) patchMutation.mutate({ excerpt: excerpt.trim() || null });
          }}
          rows={3}
          placeholder="Short summary shown on the blog index."
        />
      </div>

      <div className="space-y-1.5">
        <Label>Cover image</Label>
        {post.coverImage ? (
          <div className="relative overflow-hidden rounded-lg border border-hairline">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.coverImage.url} alt={post.coverImage.alt ?? ""} className="aspect-video w-full object-cover" />
            <button
              type="button"
              onClick={() => patchMutation.mutate({ coverImageId: null })}
              aria-label="Remove cover image"
              className="studio-focus absolute right-1.5 top-1.5 rounded-md bg-surface/90 p-1 text-muted hover:text-danger"
            >
              <X size={13} />
            </button>
          </div>
        ) : null}
        <Button type="button" variant="secondary" size="sm" onClick={() => setCoverPickerOpen(true)}>
          <ImageSquare size={14} className="mr-1.5" />
          {post.coverImage ? "Change cover" : "Pick cover"}
        </Button>
      </div>

      <div className="space-y-1.5">
        <Label>Author</Label>
        <p className="rounded-lg border border-hairline bg-app px-3 py-2 text-sm text-body">
          {post.author?.name ?? "Unknown"}
        </p>
      </div>

      <Separator />

      <div className="space-y-1.5">
        <Label>Categories</Label>
        {(categoriesQuery.data ?? []).length === 0 ? (
          <p className="text-xs text-muted">No categories yet. Add some from the blog screen.</p>
        ) : (
          <div className="space-y-1">
            {(categoriesQuery.data ?? []).map((category) => (
              <label key={category.id} className="flex items-center gap-2 text-sm text-body">
                <Checkbox
                  checked={post.categories.some((c) => c.id === category.id)}
                  onCheckedChange={(checked) =>
                    toggleTaxonomy("categoryIds", post.categories, category.id, checked === true)
                  }
                />
                {category.name}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Tags</Label>
        {(tagsQuery.data ?? []).length === 0 ? (
          <p className="text-xs text-muted">No tags yet. Add some from the blog screen.</p>
        ) : (
          <div className="space-y-1">
            {(tagsQuery.data ?? []).map((tag) => (
              <label key={tag.id} className="flex items-center gap-2 text-sm text-body">
                <Checkbox
                  checked={post.tags.some((t) => t.id === tag.id)}
                  onCheckedChange={(checked) => toggleTaxonomy("tagIds", post.tags, tag.id, checked === true)}
                />
                {tag.name}
              </label>
            ))}
          </div>
        )}
      </div>

      <MediaPickerDialog
        open={coverPickerOpen}
        onOpenChange={setCoverPickerOpen}
        accept="image"
        onPick={(media: MediaRow) => patchMutation.mutate({ coverImageId: media.id })}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete "${post.title}"?`}
        description="This permanently removes the post and its SEO settings. This cannot be undone."
        confirmLabel="Delete post"
        onConfirm={() => {
          setDeleteOpen(false);
          deleteMutation.mutate();
        }}
      />
    </div>
  );
};

export default PostSettingsPanel;
