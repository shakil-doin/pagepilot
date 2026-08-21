import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import { cn } from "@/lib/utils";
import type { CompareRow } from "@/widgets/t2s-lib";
import type { Props } from "./schema";

type CardProps = {
  variant: "old" | "new";
  title: string;
  badge: string;
  items: CompareRow[];
};

const Mark = ({ good }: { good: boolean }) => (
  <span
    aria-hidden
    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border md:h-8 md:w-8"
    style={
      good
        ? { borderColor: "rgb(255 255 255 / 0.3)", background: "rgb(255 255 255 / 0.2)", color: "#fff" }
        : {
            borderColor: "color-mix(in srgb, var(--pp-danger, #dc2626) 25%, transparent)",
            background: "color-mix(in srgb, var(--pp-danger, #dc2626) 10%, transparent)",
            color: "var(--pp-danger, #dc2626)",
          }
    }
  >
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
      {good ? (
        <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
      )}
    </svg>
  </span>
);

const CompareCard = ({ variant, title, badge, items }: CardProps) => {
  const good = variant === "new";
  return (
    <div
      className={cn("rounded-[var(--pp-radius-xl)] border p-6 md:p-8", good && "pp-on-dark")}
      style={
        good
          ? { background: "var(--pp-gradient-brand)", borderColor: "rgb(255 255 255 / 0.2)" }
          : { background: "var(--pp-c-surface)", borderColor: "var(--pp-c-border)" }
      }
    >
      <div className="flex items-center justify-between gap-4 pb-4">
        <h3 className="pp-heading text-lg font-semibold md:text-2xl">{title}</h3>
        <span
          className="inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium md:text-sm"
          style={
            good
              ? { borderColor: "rgb(255 255 255 / 0.35)", background: "#fff", color: "var(--pp-c-primary)" }
              : {
                  borderColor: "color-mix(in srgb, var(--pp-danger, #dc2626) 25%, transparent)",
                  background: "color-mix(in srgb, var(--pp-danger, #dc2626) 10%, transparent)",
                  color: "var(--pp-danger, #dc2626)",
                }
          }
        >
          {badge}
        </span>
      </div>

      {items.map((item, i) => (
        <div
          key={i}
          className="grid min-h-18 grid-cols-[1fr_auto] items-center gap-4 border-t border-dashed py-4 md:min-h-20 md:py-5"
          style={{ borderColor: good ? "rgb(255 255 255 / 0.4)" : "var(--pp-c-border)" }}
        >
          <div className="flex items-center gap-3 text-sm leading-relaxed md:gap-4 md:text-base">
            <Mark good={good} />
            <span className="min-w-0">{item.text}</span>
          </div>
          {item.tag ? (
            <span
              className="shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs md:text-sm"
              style={
                good
                  ? { background: "rgb(255 255 255 / 0.15)", color: "#fff" }
                  : { color: "var(--pp-c-textMuted)" }
              }
            >
              {item.tag}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
};

const T2sComparison = ({
  badge,
  title,
  description,
  align,
  divider,
  oldTitle,
  oldBadge,
  oldItems,
  newTitle,
  newBadge,
  newItems,
  tone,
}: Props) => (
  <Panel tone={tone}>
    <SectionHead badge={badge} title={title} description={description} align={align} dark={isDarkTone(tone)} />
    <div className="relative mt-10 grid grid-cols-1 items-start gap-6 md:mt-14 lg:grid-cols-[1fr_88px_1fr] lg:gap-x-8">
      <CompareCard variant="old" title={oldTitle} badge={oldBadge} items={oldItems} />
      <div className="relative flex h-14 items-center justify-center lg:h-full">
        <span
          className="absolute inset-x-0 top-1/2 block h-px -translate-y-1/2 lg:hidden"
          style={{ background: "var(--pp-c-border)" }}
        />
        <span
          className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 lg:block"
          style={{ background: "var(--pp-c-border)" }}
        />
        <span
          className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border text-sm font-semibold md:h-14 md:w-14"
          style={{
            background: "var(--pp-c-background)",
            borderColor: "color-mix(in srgb, var(--pp-c-primary) 25%, transparent)",
            color: "var(--pp-c-primary)",
          }}
        >
          {divider}
        </span>
      </div>
      <CompareCard variant="new" title={newTitle} badge={newBadge} items={newItems} />
    </div>
  </Panel>
);

export default T2sComparison;
