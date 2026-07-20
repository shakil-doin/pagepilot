"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { slugify } from "@/lib/utils";
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

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingKeys: string[];
  onAdd: (key: string, label: string, value: string) => void;
};

const AddTokenDialog = ({ open, onOpenChange, existingKeys, onAdd }: Props) => {
  const [label, setLabel] = useState("");
  const [key, setKey] = useState("");
  const [keyTouched, setKeyTouched] = useState(false);
  const [value, setValue] = useState("#000000");

  useEffect(() => {
    if (open) {
      setLabel("");
      setKey("");
      setKeyTouched(false);
      setValue("#000000");
    }
  }, [open]);

  const submit = () => {
    const slug = slugify(key);
    if (!slug) {
      toast.error("The key needs at least one letter or number");
      return;
    }
    if (existingKeys.includes(slug)) {
      toast.error(`A token named "${slug}" already exists`);
      return;
    }
    onAdd(slug, label.trim() || slug, value);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add custom token</DialogTitle>
          <DialogDescription>Custom tokens become available everywhere a theme color can be picked.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="token-label">Label</Label>
            <Input
              id="token-label"
              placeholder="Highlight"
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                if (!keyTouched) setKey(slugify(e.target.value));
              }}
              required
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="token-key">Key</Label>
            <Input
              id="token-key"
              placeholder="highlight"
              value={key}
              onChange={(e) => {
                setKeyTouched(true);
                setKey(e.target.value);
              }}
              required
              className="font-mono"
              spellCheck={false}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="token-value">Value</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                aria-label="Pick color"
                value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
                onChange={(e) => setValue(e.target.value)}
                className="h-9 w-12 cursor-pointer rounded-md border border-hairline bg-surface"
              />
              <Input
                id="token-value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="font-mono"
                spellCheck={false}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add token</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTokenDialog;
