"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PublishBlocker } from "@/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blockers: PublishBlocker[];
  onPublish: (note?: string) => void;
};

const PublishDialog = ({ open, onOpenChange, blockers, onPublish }: Props) => {
  const [note, setNote] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish page</DialogTitle>
          <DialogDescription>
            The current draft becomes the live version and the static page regenerates within seconds.
          </DialogDescription>
        </DialogHeader>
        {blockers.length > 0 ? (
          <div className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">
            <p className="font-medium text-warning">These issues will block publish:</p>
            <ul className="mt-1 list-inside list-disc text-body">
              {blockers.slice(0, 6).map((blocker, i) => (
                <li key={i}>{blocker.message}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="space-y-1.5">
          <Label htmlFor="publish-note">What changed? (optional)</Label>
          <Input
            id="publish-note"
            placeholder="Updated summer pricing"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onPublish(note || undefined)}>Publish now</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PublishDialog;
