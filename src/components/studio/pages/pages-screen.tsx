"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, DotsThree, Lock } from "@phosphor-icons/react";
import { api, ApiClientError } from "@/services/api";
import { timeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NewPageDialog from "@/components/studio/pages/new-page-dialog";
import ConfirmDialog from "@/components/studio/shared/confirm-dialog";

type PageRow = {
  id: string;
  path: string;
  title: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  locked: boolean;
  updatedAt: string;
  publishedRevisionId: string | null;
  _count: { revisions: number };
};

const STATUS_BADGE = { PUBLISHED: "success", DRAFT: "warning", ARCHIVED: "outline" } as const;

const PagesScreen = () => {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [newOpen, setNewOpen] = useState(searchParams.get("new") === "1");
  const [deleting, setDeleting] = useState<PageRow | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["pages", query],
    queryFn: () => api.get<{ pages: PageRow[]; total: number }>(`/api/studio/pages?query=${encodeURIComponent(query)}`),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/api/studio/pages/${id}`),
    onSuccess: () => {
      toast.success("Page deleted");
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Delete failed"),
  });

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Input
          placeholder="Search pages by title or path…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={() => setNewOpen(true)}>
          <Plus size={15} className="mr-1.5" />
          New page
        </Button>
      </div>

      {isLoading ? (
        <p className="py-16 text-center text-sm text-muted">Loading pages…</p>
      ) : (data?.pages ?? []).length === 0 ? (
        <div className="rounded-xl border border-dashed border-hairline py-16 text-center">
          <p className="text-sm font-medium text-ink">No pages yet</p>
          <p className="mt-1 text-sm text-muted">Create your first page and open it in the builder.</p>
          <Button className="mt-4" onClick={() => setNewOpen(true)}>
            <Plus size={15} className="mr-1.5" />
            New page
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-hairline bg-surface">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.pages ?? []).map((page) => (
                <TableRow key={page.id}>
                  <TableCell>
                    <Link href={`/studio/pages/${page.id}/builder`} className="group block">
                      <span className="flex items-center gap-1.5 font-medium text-ink group-hover:text-brand">
                        {page.title}
                        {page.locked ? <Lock size={12} className="text-muted" /> : null}
                      </span>
                      <span className="font-mono text-xs text-muted">{page.path}</span>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE[page.status]}>{page.status.toLowerCase()}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted">{timeAgo(page.updatedAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Page actions">
                          <DotsThree size={18} weight="bold" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/studio/pages/${page.id}/builder`}>Open builder</Link>
                        </DropdownMenuItem>
                        {page.status === "PUBLISHED" ? (
                          <DropdownMenuItem asChild>
                            <a href={page.path} target="_blank" rel="noreferrer">
                              View live
                            </a>
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem className="text-danger" onSelect={() => setDeleting(page)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <NewPageDialog open={newOpen} onOpenChange={setNewOpen} />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete "${deleting?.title}"?`}
        description={`This removes the page at ${deleting?.path} and all its revisions. This cannot be undone.`}
        confirmLabel="Delete page"
        onConfirm={() => {
          if (deleting) deleteMutation.mutate(deleting.id);
          setDeleting(null);
        }}
      />
    </div>
  );
};

export default PagesScreen;
