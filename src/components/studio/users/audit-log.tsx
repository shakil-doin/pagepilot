"use client";

import { useEffect, useState } from "react";
import { Fragment } from "react";
import { useQuery } from "@tanstack/react-query";
import { CaretDown, CaretRight } from "@phosphor-icons/react";
import { api } from "@/services/api";
import { timeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { UserRow } from "@/components/studio/users/users-screen";

type Props = {
  users: UserRow[];
};

type AuditEntry = {
  id: string;
  action: string;
  entity: string;
  detail: unknown;
  createdAt: string;
  user: { id: string; name: string | null; email: string } | null;
};

type AuditResponse = { logs: AuditEntry[]; total: number; pages: number };

const ALL_USERS = "__all__";

const AuditLog = ({ users }: Props) => {
  const [page, setPage] = useState(1);
  const [userId, setUserId] = useState(ALL_USERS);
  const [entity, setEntity] = useState("");
  const [entityDebounced, setEntityDebounced] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timer = setTimeout(() => {
      setEntityDebounced(entity.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [entity]);

  const { data, isLoading } = useQuery({
    queryKey: ["audit", page, userId, entityDebounced],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page) });
      if (userId !== ALL_USERS) params.set("userId", userId);
      if (entityDebounced) params.set("entity", entityDebounced);
      return api.get<AuditResponse>(`/api/studio/audit?${params.toString()}`);
    },
  });

  const toggle = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={userId}
          onValueChange={(value) => {
            setUserId(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_USERS}>All users</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name ?? user.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Filter by entity, e.g. Page:"
          value={entity}
          onChange={(e) => setEntity(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {isLoading ? (
        <p className="py-16 text-center text-sm text-muted">Loading audit log…</p>
      ) : (data?.logs ?? []).length === 0 ? (
        <p className="py-16 text-center text-sm text-muted">No audit entries match the current filters.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-hairline bg-surface">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>User</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.logs ?? []).map((entry) => {
                const hasDetail = entry.detail !== null && entry.detail !== undefined;
                const isOpen = expanded.has(entry.id);
                return (
                  <Fragment key={entry.id}>
                    <TableRow className={hasDetail ? "cursor-pointer" : undefined} onClick={() => hasDetail && toggle(entry.id)}>
                      <TableCell className="text-muted">
                        {hasDetail ? (isOpen ? <CaretDown size={12} /> : <CaretRight size={12} />) : null}
                      </TableCell>
                      <TableCell className="text-sm text-ink">{entry.action}</TableCell>
                      <TableCell className="font-mono text-xs text-muted">{entry.entity}</TableCell>
                      <TableCell className="text-sm text-body">{entry.user?.name ?? entry.user?.email ?? "System"}</TableCell>
                      <TableCell className="text-xs text-muted">{timeAgo(entry.createdAt)}</TableCell>
                    </TableRow>
                    {hasDetail && isOpen ? (
                      <TableRow>
                        <TableCell colSpan={5} className="bg-app">
                          <pre className="overflow-x-auto p-1 font-mono text-xs text-body">
                            {JSON.stringify(entry.detail, null, 2)}
                          </pre>
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">
          {data ? `${data.total} entries` : ""}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-xs text-muted">
            Page {page} of {data?.pages ?? 1}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= (data?.pages ?? 1)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuditLog;
