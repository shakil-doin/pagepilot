"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "@phosphor-icons/react";
import { api, ApiClientError } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MenuItemRow from "@/components/studio/navigation/menu-item-row";
import type { MenuItem } from "@/types";

type Props = {
  slot: string;
  slotLabel: string;
  initialItems: MenuItem[];
  pathsDatalistId: string;
};

// Location of an item: root items have parentIndex null, children carry the
// index of their root parent. Nesting is capped at two levels.
type Location = { parentIndex: number | null; index: number };

const MenuEditor = ({ slot, slotLabel, initialItems, pathsDatalistId }: Props) => {
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [dirty, setDirty] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newHref, setNewHref] = useState("");

  useEffect(() => {
    setItems(initialItems);
    setDirty(false);
    // Only reset when the server payload changes, not on local edits
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialItems)]);

  const apply = (updater: (current: MenuItem[]) => MenuItem[]) => {
    setItems((current) => updater(structuredClone(current)));
    setDirty(true);
  };

  const siblingsOf = (tree: MenuItem[], parentIndex: number | null): MenuItem[] =>
    parentIndex === null ? tree : (tree[parentIndex].children ??= []);

  const updateItem = ({ parentIndex, index }: Location, patch: Partial<MenuItem>) =>
    apply((tree) => {
      const siblings = siblingsOf(tree, parentIndex);
      siblings[index] = { ...siblings[index], ...patch };
      return tree;
    });

  const removeItem = ({ parentIndex, index }: Location) =>
    apply((tree) => {
      siblingsOf(tree, parentIndex).splice(index, 1);
      return tree;
    });

  const moveItem = ({ parentIndex, index }: Location, direction: -1 | 1) =>
    apply((tree) => {
      const siblings = siblingsOf(tree, parentIndex);
      const target = index + direction;
      [siblings[index], siblings[target]] = [siblings[target], siblings[index]];
      return tree;
    });

  // Root item becomes the last child of its previous sibling.
  const indentItem = (index: number) =>
    apply((tree) => {
      const [item] = tree.splice(index, 1);
      (tree[index - 1].children ??= []).push(item);
      return tree;
    });

  // Child moves back to the root, right after its parent.
  const outdentItem = ({ parentIndex, index }: Location) =>
    apply((tree) => {
      if (parentIndex === null) return tree;
      const [item] = (tree[parentIndex].children ?? []).splice(index, 1);
      tree.splice(parentIndex + 1, 0, item);
      return tree;
    });

  const addItem = () => {
    if (!newLabel || !newHref) return;
    apply((tree) => [...tree, { id: crypto.randomUUID(), label: newLabel, href: newHref }]);
    setNewLabel("");
    setNewHref("");
  };

  const saveMutation = useMutation({
    mutationFn: () => api.put("/api/studio/menus", { slot, items }),
    onSuccess: () => {
      setDirty(false);
      toast.success(`Menu saved. The site ${slot} updates instantly.`);
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Saving the menu failed"),
  });

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-hairline py-10 text-center">
          <p className="text-sm text-muted">The {slotLabel.toLowerCase()} menu is empty. Add your first item below.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={item.id} className="space-y-2">
              <MenuItemRow
                item={item}
                depth={0}
                pathsDatalistId={pathsDatalistId}
                canMoveUp={index > 0}
                canMoveDown={index < items.length - 1}
                canIndent={index > 0 && (item.children ?? []).length === 0}
                canOutdent={false}
                onChange={(patch) => updateItem({ parentIndex: null, index }, patch)}
                onRemove={() => removeItem({ parentIndex: null, index })}
                onMove={(direction) => moveItem({ parentIndex: null, index }, direction)}
                onIndent={() => indentItem(index)}
                onOutdent={() => undefined}
              />
              {(item.children ?? []).map((child, childIndex) => (
                <MenuItemRow
                  key={child.id}
                  item={child}
                  depth={1}
                  pathsDatalistId={pathsDatalistId}
                  canMoveUp={childIndex > 0}
                  canMoveDown={childIndex < (item.children ?? []).length - 1}
                  canIndent={false}
                  canOutdent
                  onChange={(patch) => updateItem({ parentIndex: index, index: childIndex }, patch)}
                  onRemove={() => removeItem({ parentIndex: index, index: childIndex })}
                  onMove={(direction) => moveItem({ parentIndex: index, index: childIndex }, direction)}
                  onIndent={() => undefined}
                  onOutdent={() => outdentItem({ parentIndex: index, index: childIndex })}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      <form
        className="flex items-end gap-2 rounded-xl border border-hairline bg-surface p-3"
        onSubmit={(event) => {
          event.preventDefault();
          addItem();
        }}
      >
        <div className="flex-1 space-y-1">
          <label htmlFor={`${slot}-new-label`} className="text-xs text-muted">
            Label
          </label>
          <Input
            id={`${slot}-new-label`}
            placeholder="About us"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
          />
        </div>
        <div className="flex-1 space-y-1">
          <label htmlFor={`${slot}-new-href`} className="text-xs text-muted">
            Link
          </label>
          <Input
            id={`${slot}-new-href`}
            placeholder="/about"
            list={pathsDatalistId}
            className="font-mono"
            value={newHref}
            onChange={(e) => setNewHref(e.target.value)}
          />
        </div>
        <Button type="submit" variant="secondary" disabled={!newLabel || !newHref}>
          <Plus size={15} className="mr-1" />
          Add item
        </Button>
      </form>

      <div className="flex justify-end">
        <Button disabled={!dirty || saveMutation.isPending} onClick={() => saveMutation.mutate()}>
          {saveMutation.isPending ? "Saving…" : `Save ${slotLabel.toLowerCase()} menu`}
        </Button>
      </div>
    </div>
  );
};

export default MenuEditor;
