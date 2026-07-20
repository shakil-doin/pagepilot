"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy } from "@phosphor-icons/react";
import { api, ApiClientError } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type InviteResult = {
  user: { id: string };
  inviteLink: string;
  mailSent: boolean;
};

const ROLES = ["SUPERADMIN", "ADMIN", "MODERATOR", "EDITOR"] as const;

const InviteUserDialog = ({ open, onOpenChange }: Props) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number]>("EDITOR");
  const [result, setResult] = useState<InviteResult | null>(null);

  const inviteMutation = useMutation({
    mutationFn: () => api.post<InviteResult>("/api/studio/users", { name, email, role }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setResult(data);
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Invite failed"),
  });

  const close = (next: boolean) => {
    if (!next) {
      setName("");
      setEmail("");
      setRole("EDITOR");
      setResult(null);
    }
    onOpenChange(next);
  };

  const copyLink = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.inviteLink);
    toast.success("Invite link copied");
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite user</DialogTitle>
          <DialogDescription>
            The invited user receives a link to set a password and sign in.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-link">Invite link</Label>
              <div className="flex gap-2">
                <Input id="invite-link" readOnly value={result.inviteLink} className="font-mono text-xs" />
                <Button type="button" variant="secondary" size="icon" aria-label="Copy invite link" onClick={copyLink}>
                  <Copy size={15} />
                </Button>
              </div>
              <p className="text-xs text-muted">
                {result.mailSent
                  ? "Email sent. You can also share this link directly."
                  : "SMTP not configured, share this link manually. It expires in 7 days."}
              </p>
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => close(false)}>
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              inviteMutation.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="invite-name">Name</Label>
              <Input
                id="invite-name"
                placeholder="Jane Cooper"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(value) => setRole(value as (typeof ROLES)[number])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r.charAt(0) + r.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => close(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={inviteMutation.isPending || !name || !email}>
                {inviteMutation.isPending ? "Inviting…" : "Send invite"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InviteUserDialog;
