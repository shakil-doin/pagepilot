"use client";

import { useState } from "react";
import { CaretDown, CaretRight, Copy, Plus, Trash, ArrowUp, ArrowDown } from "@phosphor-icons/react";
import { emptyValueFor, labelFor, type SchemaNode } from "@/components/studio/builder/inspector/schema-utils";
import FieldControl from "@/components/studio/builder/inspector/field-control";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  value: unknown;
  onChange: (value: unknown) => void;
  itemSchema: SchemaNode | undefined;
  itemLabelKey?: string;
};

// Sortable repeater: add, remove, duplicate, reorder, collapse per row.
const ListControl = ({ value, onChange, itemSchema, itemLabelKey }: Props) => {
  const items = Array.isArray(value) ? value : [];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const update = (next: unknown[]) => onChange(next);

  const itemLabel = (item: unknown, index: number): string => {
    if (itemLabelKey && item && typeof item === "object") {
      const candidate = (item as Record<string, unknown>)[itemLabelKey];
      if (typeof candidate === "string" && candidate.trim()) return candidate;
    }
    return `Item ${index + 1}`;
  };

  const itemProperties = itemSchema?.properties ?? {};

  return (
    <div className="space-y-1.5">
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <div key={index} className="rounded-lg border border-hairline bg-app">
            <div className="flex items-center gap-1 px-1.5 py-1">
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : index)}
                className="studio-focus flex min-w-0 flex-1 items-center gap-1 text-left text-xs font-medium text-ink"
              >
                {open ? <CaretDown size={11} /> : <CaretRight size={11} />}
                <span className="truncate">{itemLabel(item, index)}</span>
              </button>
              <div className="flex shrink-0 items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  disabled={index === 0}
                  aria-label="Move up"
                  onClick={() => {
                    const next = [...items];
                    [next[index - 1], next[index]] = [next[index], next[index - 1]];
                    update(next);
                  }}
                >
                  <ArrowUp size={11} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  disabled={index === items.length - 1}
                  aria-label="Move down"
                  onClick={() => {
                    const next = [...items];
                    [next[index + 1], next[index]] = [next[index], next[index + 1]];
                    update(next);
                  }}
                >
                  <ArrowDown size={11} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  aria-label="Duplicate item"
                  onClick={() => {
                    const next = [...items];
                    next.splice(index + 1, 0, structuredClone(item));
                    update(next);
                  }}
                >
                  <Copy size={11} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:text-danger"
                  aria-label="Remove item"
                  onClick={() => update(items.filter((_, i) => i !== index))}
                >
                  <Trash size={11} />
                </Button>
              </div>
            </div>
            <div className={cn("space-y-2.5 border-t border-hairline p-2", !open && "hidden")}>
              {Object.entries(itemProperties).map(([key, childSchema]) => (
                <FieldControl
                  key={key}
                  label={labelFor(key, childSchema)}
                  schema={childSchema}
                  value={item && typeof item === "object" ? (item as Record<string, unknown>)[key] : undefined}
                  onChange={(childValue) => {
                    const next = [...items];
                    next[index] = { ...(next[index] as Record<string, unknown>), [key]: childValue };
                    update(next);
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}
      <Button
        variant="secondary"
        size="sm"
        className="w-full"
        onClick={() => {
          update([...items, emptyValueFor(itemSchema ?? {})]);
          setOpenIndex(items.length);
        }}
      >
        <Plus size={12} className="mr-1" />
        Add item
      </Button>
    </div>
  );
};

export default ListControl;
