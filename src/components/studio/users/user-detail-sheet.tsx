"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiClientError } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import ConfirmDialog from "@/components/studio/shared/confirm-dialog";

type Props = {
  userId: string | null;
  onClose: () => void;
};

type Role = "SUPERADMIN" | "ADMIN" | "MODERATOR" | "EDITOR";
type Access = "VIEW" | "EDIT" | "PUBLISH";

type UserDetail = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  status: "ACTIVE" | "DISABLED";
  createdAt: string;
  permissions: { pageId: string; access: Access; page: { id: string; path: string; title: string } }[];
};

type PageRow = { id: string; path: string; title: string };

const ROLES: Role[] = ["SUPERADMIN", "ADMIN", "MODERATOR", "EDITOR"];
const NONE = "NONE";
const ACCESS_OPTIONS = [NONE, "VIEW", "EDIT", "PUBLISH"] as const;

const UserDetailSheet = ({ userId, onClose }: Props) => {
  const queryClient = useQueryClient();
  const [pendingRole, setPendingRole] = useState<Role | null>(null);
  const [statusConfirm, setStatusConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [grants, setGrants] = useState<Record<string, string>>({});
  const [grantsDirty, setGrantsDirty] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => api.get<UserDetail>(`/api/studio/users/${userId}`),
    enabled: userId !== null,
  });

  const { data: pagesData } = useQuery({
    queryKey: ["pages", ""],
    queryFn: () => api.get<{ pages: PageRow[]; total: number }>("/api/studio/pages?query="),
    enabled: userId !== null,
  });

  useEffect(() => {
    if (!user) return;
    const next: Record<string, string> = {};
    for (const permission of user.permissions) next[permission.pageId] = permission.access;
    setGrants(next);
    setGrantsDirty(false);
    setPassword("");
  }, [user]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
    queryClient.invalidateQueries({ queryKey: ["user", userId] });
  };

  const patchMutation = useMutation({
    mutationFn: (body: Partial<{ role: Role; status: "ACTIVE" | "DISABLED"; password: string }>) =>
      api.patch(`/api/studio/users/${userId}`, body),
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Update failed"),
  });

  const grantsMutation = useMutation({
    mutationFn: () =>
      api.put(`/api/studio/users/${userId}`, {
        grants: Object.entries(grants)
          .filter(([, access]) => access !== NONE)
          .map(([pageId, access]) => ({ pageId, access })),
      }),
    onSuccess: () => {
      toast.success("Page permissions saved");
      setGrantsDirty(false);
      invalidate();
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Saving permissions failed"),
  });

  const changeRole = () => {
    if (!pendingRole) return;
    patchMutation.mutate(
      { role: pendingRole },
      {
        onSuccess: () => {
          toast.success(`Role changed to ${pendingRole.toLowerCase()}. Sessions were revoked.`);
          invalidate();
        },
      },
    );
    setPendingRole(null);
  };

  const toggleStatus = () => {
    if (!user) return;
    const next = user.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
    patchMutation.mutate(
      { status: next },
      {
        onSuccess: () => {
          toast.success(next === "DISABLED" ? "User deactivated" : "User reactivated");
          invalidate();
        },
      },
    );
    setStatusConfirm(false);
  };

  const setUserPassword = () => {
    patchMutation.mutate(
      { password },
      {
        onSuccess: () => {
          toast.success("Password updated");
          setPassword("");
        },
      },
    );
  };

  return (
    <Sheet open={userId !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-120 max-w-full overflow-y-auto sm:w-130">
        {user ? (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                {user.name ?? "Unnamed"}
                <Badge variant={user.status === "ACTIVE" ? "success" : "outline"}>{user.status.toLowerCase()}</Badge>
              </SheetTitle>
              <SheetDescription>{user.email}</SheetDescription>
            </SheetHeader>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={user.role} onValueChange={(value) => setPendingRole(value as Role)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.charAt(0) + role.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted">Changing the role signs the user out everywhere.</p>
            </div>

            <div className="space-y-2">
              <Label>Account status</Label>
              <div>
                <Button
                  variant={user.status === "ACTIVE" ? "destructive" : "secondary"}
                  size="sm"
                  onClick={() => setStatusConfirm(true)}
                >
                  {user.status === "ACTIVE" ? "Deactivate user" : "Reactivate user"}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-password">Set password</Label>
              <div className="flex gap-2">
                <Input
                  id="user-password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  variant="secondary"
                  disabled={password.length < 8 || patchMutation.isPending}
                  onClick={setUserPassword}
                >
                  Set
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Page permissions</Label>
                <Button size="sm" disabled={!grantsDirty || grantsMutation.isPending} onClick={() => grantsMutation.mutate()}>
                  {grantsMutation.isPending ? "Saving…" : "Save permissions"}
                </Button>
              </div>
              <p className="text-xs text-muted">
                Moderators and editors only see pages granted here. Admins and superadmins bypass page permissions.
              </p>
              <div className="divide-y divide-hairline rounded-lg border border-hairline">
                {(pagesData?.pages ?? []).map((page) => (
                  <div key={page.id} className="flex items-center justify-between gap-3 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-ink">{page.title}</p>
                      <p className="truncate font-mono text-xs text-muted">{page.path}</p>
                    </div>
                    <Select
                      value={grants[page.id] ?? NONE}
                      onValueChange={(value) => {
                        setGrants((current) => ({ ...current, [page.id]: value }));
                        setGrantsDirty(true);
                      }}
                    >
                      <SelectTrigger className="w-28 shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ACCESS_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option === NONE ? "None" : option.charAt(0) + option.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
                {(pagesData?.pages ?? []).length === 0 ? (
                  <p className="px-3 py-4 text-center text-sm text-muted">No pages exist yet.</p>
                ) : null}
              </div>
            </div>
          </>
        ) : (
          <p className="py-16 text-center text-sm text-muted">Loading user…</p>
        )}
      </SheetContent>

      <ConfirmDialog
        open={pendingRole !== null}
        onOpenChange={(open) => !open && setPendingRole(null)}
        title={`Change ${user?.name ?? user?.email ?? "user"}'s role to ${pendingRole?.toLowerCase()}?`}
        description="All of this user's active sessions will be revoked and they must sign in again."
        confirmLabel="Change role"
        onConfirm={changeRole}
      />
      <ConfirmDialog
        open={statusConfirm}
        onOpenChange={setStatusConfirm}
        title={
          user?.status === "ACTIVE"
            ? `Deactivate ${user?.name ?? user?.email}?`
            : `Reactivate ${user?.name ?? user?.email}?`
        }
        description={
          user?.status === "ACTIVE"
            ? "The user is signed out immediately and can no longer access the Studio."
            : "The user can sign in to the Studio again."
        }
        confirmLabel={user?.status === "ACTIVE" ? "Deactivate" : "Reactivate"}
        onConfirm={toggleStatus}
      />
    </Sheet>
  );
};

export default UserDetailSheet;
