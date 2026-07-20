"use client";

import { ArrowUp, ArrowDown, TextIndent, TextOutdent, Trash } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MenuItem } from "@/types";

type Props = {
  item: MenuItem;
  depth: 0 | 1;
  pathsDatalistId: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canIndent: boolean;
  canOutdent: boolean;
  onChange: (patch: Partial<MenuItem>) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
  onIndent: () => void;
  onOutdent: () => void;
};

const MenuItemRow = ({
  item,
  depth,
  pathsDatalistId,
  canMoveUp,
  canMoveDown,
  canIndent,
  canOutdent,
  onChange,
  onRemove,
  onMove,
  onIndent,
  onOutdent,
}: Props) => (
  <div
    className="flex items-center gap-2 rounded-lg border border-hairline bg-surface p-2"
    style={depth === 1 ? { marginLeft: "2rem" } : undefined}
  >
    <Input
      aria-label="Menu item label"
      value={item.label}
      onChange={(e) => onChange({ label: e.target.value })}
      className="h-8 flex-1 text-sm"
    />
    <Input
      aria-label="Menu item link"
      value={item.href}
      list={pathsDatalistId}
      onChange={(e) => onChange({ href: e.target.value })}
      className="h-8 flex-1 font-mono text-xs"
    />
    <div className="flex shrink-0 items-center">
      <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Move up" disabled={!canMoveUp} onClick={() => onMove(-1)}>
        <ArrowUp size={14} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        aria-label="Move down"
        disabled={!canMoveDown}
        onClick={() => onMove(1)}
      >
        <ArrowDown size={14} />
      </Button>
      {depth === 0 ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          aria-label="Indent under previous item"
          disabled={!canIndent}
          onClick={onIndent}
        >
          <TextIndent size={14} />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          aria-label="Move to top level"
          disabled={!canOutdent}
          onClick={onOutdent}
        >
          <TextOutdent size={14} />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-danger hover:bg-danger/10"
        aria-label="Remove item"
        onClick={onRemove}
      >
        <Trash size={14} />
      </Button>
    </div>
  </div>
);

export default MenuItemRow;
