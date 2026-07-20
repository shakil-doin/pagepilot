"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "@phosphor-icons/react";
import { api } from "@/services/api";
import { timeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import InviteUserDialog from "@/components/studio/users/invite-user-dialog";
import UserDetailSheet from "@/components/studio/users/user-detail-sheet";
import AuditLog from "@/components/studio/users/audit-log";

export type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: "SUPERADMIN" | "ADMIN" | "MODERATOR" | "EDITOR";
  status: "ACTIVE" | "DISABLED";
  image: string | null;
  createdAt: string;
  _count: { permissions: number; posts: number };
};

const ROLE_BADGE = {
  SUPERADMIN: "danger",
  ADMIN: "default",
  MODERATOR: "info",
  EDITOR: "outline",
} as const;

const UsersScreen = () => {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.get<UserRow[]>("/api/studio/users"),
  });

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-ink">Users</h2>
        <p className="text-sm text-muted">Manage team members, roles, and page permissions.</p>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="audit">Audit log</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="mb-4 flex justify-end">
            <Button onClick={() => setInviteOpen(true)}>
              <Plus size={15} className="mr-1.5" />
              Invite user
            </Button>
          </div>

          {isLoading ? (
            <p className="py-16 text-center text-sm text-muted">Loading users…</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-hairline bg-surface">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(users ?? []).map((user) => (
                    <TableRow
                      key={user.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedUserId(user.id)}
                    >
                      <TableCell>
                        <span className="block text-sm font-medium text-ink">{user.name ?? "Unnamed"}</span>
                        <span className="text-xs text-muted">{user.email}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={ROLE_BADGE[user.role]}>{user.role.toLowerCase()}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === "ACTIVE" ? "success" : "outline"}>
                          {user.status.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted">{timeAgo(user.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="audit">
          <AuditLog users={users ?? []} />
        </TabsContent>
      </Tabs>

      <InviteUserDialog open={inviteOpen} onOpenChange={setInviteOpen} />
      <UserDetailSheet userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
    </div>
  );
};

export default UsersScreen;
