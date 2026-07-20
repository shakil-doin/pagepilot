"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft } from "@phosphor-icons/react";
import { api, ApiClientError } from "@/services/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ContentEditor from "@/components/studio/blog/post-editor/content-editor";
import PostSidebar from "@/components/studio/blog/post-editor/post-sidebar";
import { POST_STATUS_BADGE } from "@/components/studio/blog/post-status";
import type { StudioPost } from "@/components/studio/blog/post-editor/post-types";

type SaveState = "saved" | "saving" | "dirty";

const SAVE_LABEL: Record<SaveState, string> = {
  saved: "Saved ✓",
  saving: "Saving…",
  dirty: "Unsaved changes",
};

const PostEditor = ({ postId }: { postId: string }) => {
  const [title, setTitle] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const loaded = useRef(false);
  // Latest unsaved title/content; the debounce timer reads this ref so rapid
  // edits collapse into one PATCH.
  const pending = useRef<{ title: string; content: unknown }>({ title: "", content: null });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => api.get<StudioPost>(`/api/studio/blog/posts/${postId}`),
  });

  useEffect(() => {
    if (post && !loaded.current) {
      loaded.current = true;
      setTitle(post.title);
      pending.current = { title: post.title, content: post.content };
    }
  }, [post]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const saveMutation = useMutation({
    mutationFn: (input: { title: string; content: unknown }) =>
      api.patch(`/api/studio/blog/posts/${postId}`, input),
    onMutate: () => setSaveState("saving"),
    onSuccess: () => setSaveState((state) => (state === "saving" ? "saved" : state)),
    onError: (err) => {
      setSaveState("dirty");
      toast.error(err instanceof ApiClientError ? err.message : "Autosave failed");
    },
  });

  // mutate is referentially stable in react-query v5, safe inside the timeout.
  const { mutate: savePost } = saveMutation;

  const queueSave = (partial: Partial<{ title: string; content: unknown }>) => {
    pending.current = { ...pending.current, ...partial };
    setSaveState("dirty");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => savePost(pending.current), 1000);
  };

  if (isLoading) return <p className="py-16 text-center text-sm text-muted">Loading post…</p>;
  if (!post) return <p className="py-16 text-center text-sm text-muted">Post not found.</p>;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-hairline bg-surface px-3">
        <Button variant="ghost" size="icon" asChild aria-label="Back to posts">
          <Link href="/studio/blog">
            <ArrowLeft size={16} />
          </Link>
        </Button>
        <span className="truncate text-sm font-medium text-ink">{title || "Untitled post"}</span>
        <Badge variant={POST_STATUS_BADGE[post.status]}>{post.status.toLowerCase()}</Badge>
        <span
          className={cn(
            "ml-1 shrink-0 text-xs",
            saveState === "saved" && "text-success",
            saveState === "saving" && "text-muted",
            saveState === "dirty" && "text-warning",
          )}
        >
          {SAVE_LABEL[saveState]}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-6xl items-start gap-8 p-6">
          <div className="min-w-0 flex-1">
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                queueSave({ title: e.target.value });
              }}
              placeholder="Post title"
              aria-label="Post title"
              className="w-full border-none bg-transparent text-3xl font-bold text-ink outline-none placeholder:text-muted"
            />
            <ContentEditor initialContent={post.content} onChange={(json) => queueSave({ content: json })} />
          </div>
          <PostSidebar post={post} />
        </div>
      </div>
    </div>
  );
};

export default PostEditor;
