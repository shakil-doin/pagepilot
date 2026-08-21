import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const T2sMarketsInstruments = ({ badge, title, description, columns, cards, tone }: Props) => {
  const dark = isDarkTone(tone);

  return (
    <Panel tone={tone}>
      <div className="flex flex-col items-center gap-10 md:gap-14">
        <SectionHead badge={badge} title={title} description={description} align="center" dark={dark} />

        <div
          className={cn("grid w-full auto-rows-fr grid-cols-1 gap-5 sm:grid-cols-2", {
            "lg:grid-cols-2": columns === 2,
            "lg:grid-cols-3": columns === 3,
            "lg:grid-cols-4": columns === 4,
          })}
        >
          {cards.map((card, i) => (
            <div
              key={i}
              className="flex h-full flex-col rounded-[var(--pp-radius-lg)] p-6 md:p-8"
              style={{ background: dark ? "rgb(255 255 255 / 0.07)" : "var(--pp-c-surface)" }}
            >
              {card.badge ? (
                <span
                  className="w-fit rounded-full px-4 py-2 text-sm font-semibold"
                  style={{
                    background: "color-mix(in srgb, var(--pp-c-primary) 14%, transparent)",
                    color: "var(--pp-c-primary)",
                  }}
                >
                  {card.badge}
                </span>
              ) : null}

              <div className="mt-8 flex flex-1 flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="pp-heading text-xl font-semibold md:text-2xl">{card.title}</h3>
                  {card.subtitle ? <p className="pp-muted text-base font-medium">{card.subtitle}</p> : null}
                </div>
                {card.description ? <p className="pp-muted text-base leading-7">{card.description}</p> : null}
                {card.check ? (
                  <p className="mt-auto flex items-start gap-2 text-base font-medium">
                    <svg
                      viewBox="0 0 20 20"
                      className="mt-0.5 h-5 w-5 shrink-0"
                      fill="none"
                      stroke="var(--pp-c-primary)"
                      strokeWidth="3"
                      aria-hidden
                    >
                      <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {card.check}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
};

export default T2sMarketsInstruments;
