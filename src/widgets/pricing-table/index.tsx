import Section from "@/components/site/section";
import SiteButton from "@/components/site/site-button";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const PricingTable = ({ title, description, plans, background }: Props) => (
  <Section background={background} className="py-14 md:py-20">
    {title || description ? (
      <div className="mx-auto mb-12 max-w-2xl text-center">
        {title ? (
          <h2 className="pp-heading" style={{ fontSize: "var(--pp-text-h2)" }}>
            {title}
          </h2>
        ) : null}
        {description ? <p className="pp-muted mt-4 text-lg">{description}</p> : null}
      </div>
    ) : null}
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan, i) => (
        <div
          key={i}
          className={cn(
            "relative flex h-full flex-col rounded-[var(--pp-radius-lg)] border p-8",
            plan.highlighted && "border-2",
          )}
          style={{ borderColor: plan.highlighted ? "var(--pp-c-primary)" : "var(--pp-c-border)" }}
        >
          {plan.highlighted ? (
            <span
              className="pp-on-dark absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: "var(--pp-c-primary)" }}
            >
              Most popular
            </span>
          ) : null}
          <h3 className="pp-heading text-lg font-semibold">{plan.name}</h3>
          <p className="mt-4">
            <span className="pp-heading text-4xl font-bold">{plan.price}</span>
            {plan.period ? <span className="pp-muted ml-1.5">{plan.period}</span> : null}
          </p>
          {plan.description ? <p className="pp-muted mt-3 leading-relaxed">{plan.description}</p> : null}
          {plan.features.length > 0 ? (
            <ul className="mt-6 flex-1 space-y-3">
              {plan.features.map((feature, f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--pp-c-primary)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mt-0.5 shrink-0"
                    aria-hidden
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{feature.text}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex-1" />
          )}
          {plan.button ? (
            <div className="mt-8">
              <SiteButton button={plan.button} className="w-full" />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  </Section>
);

export default PricingTable;
