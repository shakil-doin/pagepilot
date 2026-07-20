"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiClientError } from "@/services/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostSettingsPanel from "@/components/studio/blog/post-editor/post-settings-panel";
import SeoPanel, { type SeoFormValue } from "@/components/studio/seo/seo-panel";
import type { StudioPost } from "@/components/studio/blog/post-editor/post-types";

const PostSidebar = ({ post }: { post: StudioPost }) => {
  const queryClient = useQueryClient();

  const seoMutation = useMutation({
    mutationFn: (seo: SeoFormValue) => api.put(`/api/studio/blog/posts/${post.id}/seo`, seo),
    onSuccess: () => {
      toast.success("SEO saved");
      queryClient.invalidateQueries({ queryKey: ["post", post.id] });
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Could not save SEO"),
  });

  return (
    <aside className="w-80 shrink-0">
      <Tabs defaultValue="post">
        <TabsList className="w-full">
          <TabsTrigger value="post" className="flex-1">
            Post
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex-1">
            SEO
          </TabsTrigger>
        </TabsList>
        <TabsContent value="post">
          <PostSettingsPanel post={post} />
        </TabsContent>
        <TabsContent value="seo">
          <SeoPanel
            value={post.seo}
            onSave={(seo) => seoMutation.mutateAsync(seo)}
            titleFallback={post.title}
            urlPath={`/blog/${post.slug}`}
          />
        </TabsContent>
      </Tabs>
    </aside>
  );
};

export default PostSidebar;
