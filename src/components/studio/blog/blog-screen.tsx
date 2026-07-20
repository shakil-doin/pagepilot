"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostsTable from "@/components/studio/blog/posts-table";
import TaxonomyManager from "@/components/studio/blog/taxonomy-manager";

const BlogScreen = () => (
  <div className="mx-auto max-w-5xl p-6">
    <Tabs defaultValue="posts">
      <TabsList className="mb-4">
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger value="taxonomy">Categories &amp; tags</TabsTrigger>
      </TabsList>
      <TabsContent value="posts">
        <PostsTable />
      </TabsContent>
      <TabsContent value="taxonomy">
        <TaxonomyManager />
      </TabsContent>
    </Tabs>
  </div>
);

export default BlogScreen;
