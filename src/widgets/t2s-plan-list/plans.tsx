"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Plan, Props } from "./schema";

type ClientProps = Omit<Props, "badge" | "title" | "description" | "tone"> & { dark: boolean };

const Check = () => (
  <span
    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
    style={{ background: "color-mix(in srgb, var(--pp-c-primary) 12%, transparent)", color: "var(--pp-c-primary)" }}
    aria-hidden
  >
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

const PlanCard = ({ plan, yearly, ribbon, dark }: { plan: Plan; yearly: boolean; ribbon?: string; dark: boolean }) => {
  const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
  const oldPrice = yearly ? plan.yearlyOldPrice : plan.monthlyOldPrice;
  const period = yearly ? plan.yearlyPeriod : plan.monthlyPeriod;
  const note = yearly ? plan.yearlyNote : plan.monthlyNote;
  const save = yearly ? plan.yearlySave : plan.monthlySave;

  return (
    <article
      className="flex w-full flex-col overflow-hidden rounded-[var(--pp-radius-xl)] p-1.5"
      style={{ background: yearly ? "var(--pp-c-primary)" : "var(--pp-c-border)" }}
    >
      {yearly && ribbon ? (
        <p className="py-2 text-center text-sm font-bold tracking-wide text-white">{ribbon}</p>
      ) : null}

      <div
        className="flex flex-1 flex-col gap-5 rounded-[var(--pp-radius-lg)] p-5 md:p-8"
        style={{ background: dark ? "var(--pp-c-secondary)" : "var(--pp-c-background)" }}
      >
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex flex-wrap items-baseline gap-1.5">
              <h3 className="pp-heading text-2xl font-medium md:text-3xl">{plan.name}</h3>
              {plan.subtitle ? <span className="pp-muted text-base md:text-xl">{plan.subtitle}</span> : null}
            </div>
            {plan.popular && plan.popularLabel ? (
              <span
                className="inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-sm"
                style={{
                  background: "color-mix(in srgb, var(--pp-c-primary) 12%, transparent)",
                  color: "var(--pp-c-primary)",
                }}
              >
                {plan.popularLabel}
              </span>
            ) : null}
          </div>

          {save ? (
            <span
              className="flex h-7 w-fit items-center rounded-full px-3 text-xs font-medium text-white md:h-8 md:text-sm"
              style={{ background: "var(--pp-c-primary)" }}
            >
              {save}
            </span>
          ) : null}

          <div className="mt-1 flex flex-wrap items-center gap-2">
            {oldPrice ? <span className="pp-muted text-base line-through">{oldPrice}</span> : null}
            <span className="pp-heading text-2xl font-semibold md:text-3xl">{price}</span>
            {period ? <span className="pp-muted text-sm">{period}</span> : null}
          </div>
          {note ? <p className="pp-muted text-base md:text-lg">{note}</p> : null}

          {yearly && plan.yearlyHint ? (
            <span
              className="mt-1 inline-flex w-fit items-center rounded-[var(--pp-radius-md)] border px-3 py-1 text-sm font-medium"
              style={{
                borderColor: "color-mix(in srgb, var(--pp-c-primary) 35%, transparent)",
                background: "color-mix(in srgb, var(--pp-c-primary) 8%, transparent)",
                color: "var(--pp-c-primary)",
              }}
            >
              {plan.yearlyHint}
            </span>
          ) : null}
        </div>

        <Link
          href={plan.ctaLink.href}
          target={plan.ctaLink.newTab ? "_blank" : undefined}
          rel={plan.ctaLink.newTab ? "noopener noreferrer" : undefined}
          className={cn(
            "inline-flex h-12 items-center justify-center px-6 text-base font-medium md:h-14",
            plan.popular ? "pp-btn-primary" : "pp-btn-secondary",
          )}
        >
          {plan.ctaLabel}
        </Link>

        <div className="h-px w-full" style={{ background: "var(--pp-c-border)" }} />

        <div className="flex flex-1 flex-col gap-3">
          {plan.featuresTitle ? <p className="pp-muted text-base md:text-lg">{plan.featuresTitle}</p> : null}
          <ul className="flex flex-col gap-3 md:gap-4">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-base md:items-center md:text-lg">
                <Check />
                <span>{feature.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
};

const PlanListClient = ({
  monthlyLabel,
  yearlyLabel,
  toggleBadge,
  defaultCycle,
  yearlyRibbon,
  plans,
  dark,
}: ClientProps) => {
  const [yearly, setYearly] = useState(defaultCycle === "yearly");
  if (plans.length === 0) return null;

  return (
    <div className="mt-10">
      <div className="mb-10 flex items-center justify-center gap-3 md:gap-4">
        {([false, true] as const).map((value) => (
          <button
            key={String(value)}
            type="button"
            onClick={() => setYearly(value)}
            aria-pressed={yearly === value}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors md:text-base",
              yearly === value ? "text-white" : "pp-muted",
            )}
            style={yearly === value ? { background: "var(--pp-c-primary)" } : undefined}
          >
            {value ? yearlyLabel : monthlyLabel}
          </button>
        ))}
        {toggleBadge ? (
          <span
            className="rounded-[var(--pp-radius-md)] px-3 py-1.5 text-xs font-bold md:text-sm"
            style={{ background: "var(--pp-warning, #fef3c7)", color: "#734d17" }}
          >
            {toggleBadge}
          </span>
        ) : null}
      </div>

      <div className="mx-auto grid w-full max-w-5xl items-start gap-8 lg:grid-cols-2">
        {plans.map((plan, i) => (
          <PlanCard key={i} plan={plan} yearly={yearly} ribbon={yearlyRibbon} dark={dark} />
        ))}
      </div>
    </div>
  );
};

export default PlanListClient;
