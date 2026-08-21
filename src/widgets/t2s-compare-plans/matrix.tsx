"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Group, Props } from "./schema";

type MatrixProps = Omit<Props, "badge" | "title" | "description" | "tone"> & { dark: boolean };

const Cell = ({ value, text }: { value: "yes" | "no" | "text"; text?: string }) => {
  if (value === "yes") {
    return (
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full"
        style={{ background: "color-mix(in srgb, var(--pp-c-primary) 12%, transparent)", color: "var(--pp-c-primary)" }}
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
          <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  if (value === "no") return <span className="pp-muted text-xl">–</span>;
  return <span className="text-sm md:text-base">{text}</span>;
};

const GroupBlock = ({ group, dark }: { group: Group; dark: boolean }) => (
  <div className="w-full">
    <div className="pb-3 pt-6 text-sm font-medium lg:text-base" style={{ color: "var(--pp-c-primary)" }}>
      {group.category}
    </div>
    {group.rows.map((row, i) => (
      <div
        key={i}
        className="grid min-h-14 grid-cols-[1fr_78px_78px] items-center border-b last:border-b-0 md:min-h-12 md:grid-cols-[1fr_110px_110px] lg:grid-cols-[1fr_130px_130px]"
        style={{ borderColor: dark ? "rgb(255 255 255 / 0.14)" : "var(--pp-c-border)" }}
      >
        <div className="py-2 pr-3 text-sm md:text-base">{row.name}</div>
        <div className="flex items-center justify-center">
          <Cell value={row.aValue} text={row.aText} />
        </div>
        <div className="flex items-center justify-center">
          <Cell value={row.bValue} text={row.bText} />
        </div>
      </div>
    ))}
  </div>
);

const PlanMatrix = ({
  featuresLabel,
  columnA,
  columnB,
  groups,
  visibleGroups,
  footnote,
  expandLabel,
  collapseLabel,
  dark,
}: MatrixProps) => {
  const [expanded, setExpanded] = useState(false);
  if (groups.length === 0) return null;

  const cut = visibleGroups > 0 ? visibleGroups : groups.length;
  const shown = groups.slice(0, cut);
  const hidden = groups.slice(cut);

  return (
    <div
      className="mx-auto w-full max-w-4xl overflow-hidden rounded-[var(--pp-radius-xl)] border-8 p-5 pb-0 md:border-[10px] md:p-8 md:pb-0"
      style={{
        borderColor: "color-mix(in srgb, var(--pp-c-primary) 10%, transparent)",
        background: dark ? "rgb(255 255 255 / 0.05)" : "var(--pp-c-background)",
      }}
    >
      <div className="mb-6 grid grid-cols-[1fr_78px_78px] items-center md:mb-8 md:grid-cols-[1fr_110px_110px] lg:grid-cols-[1fr_130px_130px]">
        <h3 className="pp-muted text-xl font-medium">{featuresLabel}</h3>
        <span className="text-center text-[15px] font-medium md:text-lg lg:text-xl">{columnA}</span>
        <span className="text-center text-[15px] font-medium md:text-lg lg:text-xl" style={{ color: "var(--pp-c-primary)" }}>
          {columnB}
        </span>
      </div>

      {shown.map((group, i) => (
        <GroupBlock key={i} group={group} dark={dark} />
      ))}
      {expanded ? hidden.map((group, i) => <GroupBlock key={i} group={group} dark={dark} />) : null}

      {footnote || hidden.length > 0 ? (
        <div
          className="mt-3 flex min-h-20 flex-col items-start justify-center gap-3 border-t py-5 md:flex-row md:items-center md:justify-between"
          style={{ borderColor: dark ? "rgb(255 255 255 / 0.14)" : "var(--pp-c-border)" }}
        >
          {footnote ? (
            <p className="text-base font-medium" style={{ color: "var(--pp-c-primary)" }}>
              {footnote}
            </p>
          ) : null}
          {hidden.length > 0 ? (
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              aria-expanded={expanded}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm"
              style={{
                background: "color-mix(in srgb, var(--pp-c-primary) 12%, transparent)",
                color: "var(--pp-c-primary)",
              }}
            >
              {expanded ? collapseLabel : expandLabel}
              <svg
                viewBox="0 0 24 24"
                className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default PlanMatrix;
