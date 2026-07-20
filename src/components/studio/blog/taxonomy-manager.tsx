"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash } from "@phosphor-icons/react";
import { api, ApiClientError } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ConfirmDialog from "@/components/studio/shared/confirm-dialog";

type TaxonomyRow = {
  id: string;
  name: string;
  slug: string;
  _count: { posts: number };
};

type SectionProps = {
  title: string;
  singular: string;
  endpoint: string;
  queryKey: string;
};

const TaxonomySection = ({ title, singular, endpoint, queryKey }: SectionProps) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [deleting, setDeleting] = useState<TaxonomyRow | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [queryKey] });
    queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
  };

  const { data, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: () => api.get<TaxonomyRow[]>(endpoint),
  });

  const createMutation = useMutation({
    mutationFn: () => api.post(endpoint, { name }),
    onSuccess: () => {
      setName("");
      invalidate();
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : `Could not add the ${singular}`),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`${endpoint}?id=${id}`),
    onSuccess: () => {
      toast.success(`${singular.charAt(0).toUpperCase()}${singular.slice(1)} deleted`);
      invalidate();
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Delete failed"),
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (name.trim()) createMutation.mutate();
          }}
        >
          <Input
            placeholder={`New ${singular} name`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 text-xs"
          />
          <Button type="submit" size="sm" variant="secondary" disabled={createMutation.isPending || !name.trim()}>
            <Plus size={14} className="mr-1" />
            Add
          </Button>
        </form>

        {isLoading ? (
          <p className="py-6 text-center text-xs text-muted">Loading…</p>
        ) : (data ?? []).length === 0 ? (
          <p className="py-6 text-center text-xs text-muted">No {title.toLowerCase()} yet.</p>
        ) : (
          <ul className="divide-y divide-hairline">
            {(data ?? []).map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-2 py-1.5">
                <span className="min-w-0">
                  <span className="block truncate text-sm text-ink">{row.name}</span>
                  <span className="font-mono text-[11px] text-muted">{row.slug}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  <Badge variant="outline">
                    {row._count.posts} post{row._count.posts === 1 ? "" : "s"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted hover:text-danger"
                    aria-label={`Delete ${singular} ${row.name}`}
                    onClick={() => setDeleting(row)}
                  >
                    <Trash size={14} />
                  </Button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete ${singular} "${deleting?.name}"?`}
        description={`Posts keep their content but lose this ${singular}. This cannot be undone.`}
        confirmLabel={`Delete ${singular}`}
        onConfirm={() => {
          if (deleting) deleteMutation.mutate(deleting.id);
          setDeleting(null);
        }}
      />
    </Card>
  );
};

const TaxonomyManager = () => (
  <div className="grid gap-4 md:grid-cols-2">
    <TaxonomySection title="Categories" singular="category" endpoint="/api/studio/blog/categories" queryKey="blog-categories" />
    <TaxonomySection title="Tags" singular="tag" endpoint="/api/studio/blog/tags" queryKey="blog-tags" />
  </div>
);

export default TaxonomyManager;
