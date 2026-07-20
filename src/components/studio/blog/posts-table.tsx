"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "@phosphor-icons/react";
import { api } from "@/services/api";
import { timeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NewPostDialog from "@/components/studio/blog/new-post-dialog";
import { POST_STATUS_BADGE, type PostStatus } from "@/components/studio/blog/post-status";

type PostRow = {
  id: string;
  slug: string;
  title: string;
  status: PostStatus;
  publishedAt: string | null;
  scheduledFor: string | null;
  updatedAt: string;
  author: { id: string; name: string | null };
  categories: { id: string; name: string }[];
};

const STATUSES: PostStatus[] = ["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"];

const PostsTable = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [newOpen, setNewOpen] = useState(searchParams.get("new") === "1");

  const params = new URLSearchParams({ query, page: String(page) });
  if (status !== "ALL") params.set("status", status);

  const { data, isLoading } = useQuery({
    queryKey: ["blog-posts", query, status, page],
    queryFn: () => api.get<{ posts: PostRow[]; total: number; pages: number }>(`/api/studio/blog/posts?${params}`),
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search posts by title or slug…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="w-64"
          />
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setNewOpen(true)}>
          <Plus size={15} className="mr-1.5" />
          New post
        </Button>
      </div>

      {isLoading ? (
        <p className="py-16 text-center text-sm text-muted">Loading posts…</p>
      ) : (data?.posts ?? []).length === 0 ? (
        <div className="rounded-xl border border-dashed border-hairline py-16 text-center">
          <p className="text-sm font-medium text-ink">No posts found</p>
          <p className="mt-1 text-sm text-muted">Write your first post or adjust the filters.</p>
          <Button className="mt-4" onClick={() => setNewOpen(true)}>
            <Plus size={15} className="mr-1.5" />
            New post
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-hairline bg-surface">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Post</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.posts ?? []).map((post) => (
                <TableRow
                  key={post.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/studio/blog/${post.id}`)}
                >
                  <TableCell>
                    <span className="block font-medium text-ink">{post.title}</span>
                    <span className="font-mono text-xs text-muted">/blog/{post.slug}</span>
                  </TableCell>
                  <TableCell className="text-sm text-body">{post.author?.name ?? "Unknown"}</TableCell>
                  <TableCell>
                    <Badge variant={POST_STATUS_BADGE[post.status]}>{post.status.toLowerCase()}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="flex flex-wrap gap-1">
                      {post.categories.map((category) => (
                        <Badge key={category.id} variant="outline">
                          {category.name}
                        </Badge>
                      ))}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted">{timeAgo(post.updatedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {data && data.pages > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-1">
          {Array.from({ length: data.pages }, (_, i) => i + 1).map((n) => (
            <Button key={n} size="sm" variant={n === page ? "default" : "ghost"} onClick={() => setPage(n)}>
              {n}
            </Button>
          ))}
        </div>
      ) : null}

      <NewPostDialog open={newOpen} onOpenChange={setNewOpen} />
    </div>
  );
};

export default PostsTable;
