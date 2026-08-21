import { Fragment } from "react";
import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import type { Props } from "./schema";

const T2sLearnDifference = ({ badge, title, description, divider, cards, callout, tone }: Props) => {
  const dark = isDarkTone(tone);

  return (
    <Panel tone={tone}>
      <div className="flex flex-col items-center gap-10 md:gap-16">
        <SectionHead badge={badge} title={title} description={description} align="center" dark={dark} />

        <div className="flex w-full flex-col items-stretch gap-6 lg:flex-row lg:gap-8">
          {cards.map((card, i) => {
            const accent = card.accent === "primary" ? "var(--pp-c-primary)" : "var(--pp-c-secondary)";
            return (
              <Fragment key={i}>
                {i > 0 ? (
                  <div className="relative hidden w-10 shrink-0 self-stretch lg:block">
                    <span
                      aria-hidden
                      className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2"
                      style={{ background: "var(--pp-c-border)" }}
                    />
                    <span
                      className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-base uppercase"
                      style={{
                        background: dark ? "var(--pp-c-secondary)" : "var(--pp-c-background)",
                        borderColor: "color-mix(in srgb, var(--pp-c-primary) 30%, transparent)",
                        color: "var(--pp-c-primary)",
                      }}
                    >
                      {divider}
                    </span>
                  </div>
                ) : null}

                <div
                  className="flex flex-1 flex-col gap-6 rounded-[var(--pp-radius-xl)] border p-6 md:gap-8 md:p-8"
                  style={{
                    background: `color-mix(in srgb, ${accent} ${dark ? "16%" : "8%"}, transparent)`,
                    borderColor: `color-mix(in srgb, ${accent} 28%, transparent)`,
                  }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <h3 className="pp-heading text-xl font-semibold md:text-2xl">{card.title}</h3>
                    {card.badge ? (
                      <span
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-base font-medium"
                        style={{
                          borderColor: `color-mix(in srgb, ${accent} 35%, transparent)`,
                          background: `color-mix(in srgb, ${accent} 14%, transparent)`,
                          color: accent,
                        }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
                        {card.badge}
                      </span>
                    ) : null}
                  </div>

                  {card.text ? <p className="pp-muted text-base leading-6">{card.text}</p> : null}
                  <div className="border-t border-dashed" style={{ borderColor: "var(--pp-c-border)" }} />

                  <ul className="flex flex-col">
                    {card.items.map((item, j) => (
                      <li
                        key={j}
                        className="flex items-center gap-3 border-dashed pt-6 first:pt-0 [&:not(:first-child)]:mt-6 [&:not(:first-child)]:border-t"
                        style={{ borderColor: "var(--pp-c-border)" }}
                      >
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                          style={{ background: dark ? "rgb(255 255 255 / 0.12)" : "var(--pp-c-background)", color: accent }}
                        >
                          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
                            <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <span className="text-base md:text-lg">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Fragment>
            );
          })}
        </div>

        {callout ? (
          <div
            className="w-full rounded-[var(--pp-radius-xl)] border-x-4 border-y px-6 py-8 md:px-12 md:py-12"
            style={{
              borderColor: "var(--pp-c-primary)",
              background: "color-mix(in srgb, var(--pp-c-primary) 8%, transparent)",
            }}
          >
            <p className="pp-heading text-center text-base font-semibold md:text-xl md:leading-7">{callout}</p>
          </div>
        ) : null}
      </div>
    </Panel>
  );
};

export default T2sLearnDifference;
