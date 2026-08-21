"use client";

import { useState } from "react";
import SiteButton from "@/components/site/site-button";
import { cn } from "@/lib/utils";
import type { Props, RankingItem } from "./schema";

type TabsProps = Omit<Props, "badge" | "title" | "description" | "tone"> & { dark: boolean };

const ListBox = ({
  title,
  items,
  positive,
  dark,
}: {
  title: string;
  items: { text: string }[];
  positive: boolean;
  dark: boolean;
}) => {
  const color = positive ? "var(--pp-success, #16a34a)" : "var(--pp-danger, #dc2626)";
  return (
    <div
      className="rounded-[var(--pp-radius-lg)] border p-5 sm:p-6"
      style={{
        background: `color-mix(in srgb, ${color} ${dark ? "14%" : "8%"}, transparent)`,
        borderColor: `color-mix(in srgb, ${color} 25%, transparent)`,
      }}
    >
      <h4 className="text-lg font-semibold" style={{ color }}>
        {title}
      </h4>
      <ul className="mt-2 flex flex-col gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="pp-muted flex items-start gap-2">
            <svg viewBox="0 0 20 20" className="mt-1 h-5 w-5 shrink-0" fill="none" stroke={color} strokeWidth="3" aria-hidden>
              {positive ? (
                <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
              )}
            </svg>
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Card = ({ item, labels, dark }: { item: RankingItem; labels: TabsProps; dark: boolean }) => {
  const hasLimitations = item.limitations.length > 0;
  const verdict = item.verdict ? (
    <div
      className="rounded-[var(--pp-radius-lg)] border border-l-4 p-5 sm:p-6"
      style={{
        borderColor: "var(--pp-c-primary)",
        background: "color-mix(in srgb, var(--pp-c-primary) 8%, transparent)",
      }}
    >
      <h4 className="text-lg font-semibold" style={{ color: "var(--pp-c-primary)" }}>
        {labels.verdictLabel}
      </h4>
      <p className="pp-muted mt-2">{item.verdict}</p>
    </div>
  ) : null;

  return (
    <div
      className="w-full rounded-[var(--pp-radius-xl)] p-5 sm:p-8 lg:p-12"
      style={{ background: dark ? "rgb(255 255 255 / 0.06)" : "var(--pp-c-surface)" }}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="pp-heading text-2xl font-semibold md:text-3xl">{item.name}</h3>
            {item.badge ? (
              <span
                className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium text-white"
                style={{ background: "var(--pp-c-primary)" }}
              >
                {item.badge}
              </span>
            ) : null}
          </div>
          {item.tagline ? <p className="pp-muted">{item.tagline}</p> : null}
        </div>
        {item.score ? <span className="pp-heading shrink-0 text-lg font-semibold">{item.score}</span> : null}
      </div>

      <div className="mt-8 flex flex-col gap-6">
        {item.description ? <p className="pp-muted">{item.description}</p> : null}
        {item.buttons.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {item.buttons.map((button, i) => (
              <SiteButton key={i} button={button} size="lg" />
            ))}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <ListBox title={labels.advantagesLabel} items={item.advantages} positive dark={dark} />
          {hasLimitations ? (
            <ListBox title={labels.limitationsLabel} items={item.limitations} positive={false} dark={dark} />
          ) : (
            verdict
          )}
        </div>

        {hasLimitations ? verdict : null}
      </div>
    </div>
  );
};

const RankingsTabs = ({ dark, ...props }: TabsProps) => {
  const [active, setActive] = useState(0);
  if (props.items.length === 0) return null;
  const item = props.items[Math.min(active, props.items.length - 1)];

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div className="w-full max-w-full overflow-x-auto">
        <div
          className="mx-auto flex w-fit items-center gap-1 rounded-full p-2"
          style={{ background: dark ? "rgb(255 255 255 / 0.08)" : "var(--pp-c-surface)" }}
        >
          {props.items.map((tab, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-colors sm:px-6 sm:text-base",
                active === i ? "text-white" : "pp-muted",
              )}
              style={active === i ? { background: "var(--pp-c-primary)" } : undefined}
            >
              {tab.tab}
            </button>
          ))}
        </div>
      </div>

      <Card item={item} labels={{ ...props, dark }} dark={dark} />
    </div>
  );
};

export default RankingsTabs;
