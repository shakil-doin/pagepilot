import Glyph from "@/components/site/t2s/glyph";
import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const HowTestedView = ({
  badge,
  title,
  description,
  subtitle,
  columns,
  cards,
  note,
  tone,
  rounded,
  icons = [],
}: Props & { icons?: (string | null)[] }) => {
  const dark = isDarkTone(tone);

  return (
    <Panel tone={tone} rounded={rounded}>
      <div className="flex flex-col items-center gap-12 lg:gap-16">
        <SectionHead badge={badge} title={title} align="center" dark={dark}>
          {subtitle ? <p className="mt-4 text-lg font-medium md:text-xl">{subtitle}</p> : null}
          {description ? <p className="pp-muted mt-3 max-w-2xl text-center leading-relaxed">{description}</p> : null}
        </SectionHead>

        <div
          className={cn("grid w-full auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8", {
            "lg:grid-cols-2": columns === 2,
            "lg:grid-cols-3": columns === 3,
            "lg:grid-cols-4": columns === 4,
          })}
        >
          {cards.map((card, i) => (
            <div
              key={i}
              className="flex h-full flex-col justify-between gap-10 rounded-[var(--pp-radius-xl)] border p-6 sm:gap-14 sm:p-8"
              style={{
                background: dark ? "rgb(255 255 255 / 0.04)" : "var(--pp-c-surface)",
                borderColor: dark ? "rgb(255 255 255 / 0.15)" : "var(--pp-c-border)",
                backdropFilter: dark ? "blur(12px)" : undefined,
              }}
            >
              <span
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--pp-radius-lg)] [&>svg]:h-6 [&>svg]:w-6"
                style={{
                  background: dark ? "rgb(255 255 255 / 0.09)" : "color-mix(in srgb, var(--pp-c-primary) 12%, transparent)",
                  color: dark ? "#fff" : "var(--pp-c-primary)",
                }}
              >
                <Glyph svg={icons[i]} size={24} />
              </span>
              <div className="flex flex-col gap-3">
                <h3 className="pp-heading text-xl font-bold sm:text-2xl">{card.title}</h3>
                {card.description ? <p className="pp-muted leading-relaxed">{card.description}</p> : null}
              </div>
            </div>
          ))}
        </div>

        {note ? <p className="max-w-4xl text-center text-sm font-medium sm:text-base">{note}</p> : null}
      </div>
    </Panel>
  );
};

export default HowTestedView;
