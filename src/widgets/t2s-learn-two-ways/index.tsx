import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const T2sLearnTwoWays = ({ title, cards, tone }: Props) => {
  const dark = isDarkTone(tone);

  return (
    <Panel tone={tone}>
      <div className="flex flex-col items-center gap-10 md:gap-16">
        <h2 className="pp-heading max-w-3xl text-center leading-tight" style={{ fontSize: "var(--pp-text-h2)" }}>
          {title}
        </h2>

        <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-center lg:gap-10">
          {cards.map((card, i) => (
            <div
              key={i}
              className={cn("rounded-[var(--pp-radius-xl)] p-2.5", card.featured ? "lg:flex-[1.4]" : "lg:flex-1")}
              style={{
                background: card.featured
                  ? "color-mix(in srgb, var(--pp-c-primary) 15%, transparent)"
                  : dark
                    ? "rgb(255 255 255 / 0.08)"
                    : "var(--pp-c-surface)",
              }}
            >
              <div
                className="flex h-full flex-col gap-3 rounded-[var(--pp-radius-lg)] border p-6 md:p-10"
                style={{
                  background: dark ? "var(--pp-c-secondary)" : "var(--pp-c-background)",
                  borderColor: dark ? "rgb(255 255 255 / 0.1)" : "var(--pp-c-border)",
                }}
              >
                <div className="flex flex-col gap-7">
                  {card.badge ? (
                    <span
                      className="inline-flex w-fit items-center rounded-full px-4 py-2 text-base"
                      style={{ background: dark ? "rgb(255 255 255 / 0.1)" : "var(--pp-c-surface)" }}
                    >
                      {card.badge}
                    </span>
                  ) : null}
                  <h3 className="pp-heading text-xl font-semibold md:text-2xl">{card.title}</h3>
                </div>
                {card.text ? <p className="pp-muted text-base leading-7 md:text-lg">{card.text}</p> : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
};

export default T2sLearnTwoWays;
