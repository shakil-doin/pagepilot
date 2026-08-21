import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const T2sCompareHighlights = ({ badge, title, description, cards, tone, rounded }: Props) => {
  const dark = isDarkTone(tone);

  return (
    <Panel tone={tone} rounded={rounded}>
      <SectionHead badge={badge} title={title} description={description} align="center" dark={dark} className="mb-10 md:mb-14" />
      <div
        className={cn(
          "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6",
          cards.length % 3 === 0 ? "lg:grid-cols-3" : "lg:grid-cols-4",
        )}
      >
        {cards.map((card, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-4 rounded-[var(--pp-radius-xl)] border px-8 py-11 text-center"
            style={{
              background: dark ? "rgb(255 255 255 / 0.04)" : "var(--pp-c-surface)",
              borderColor: dark ? "rgb(255 255 255 / 0.15)" : "var(--pp-c-border)",
            }}
          >
            <span className="pp-heading text-4xl font-semibold sm:text-5xl">
              {card.value}
              {card.unit ? <span style={{ color: "var(--pp-c-primary)" }}>{card.unit}</span> : null}
            </span>
            <span className="flex flex-col gap-1.5">
              <span className="text-lg font-medium">{card.label}</span>
              {card.sublabel ? <span className="pp-muted">{card.sublabel}</span> : null}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
};

export default T2sCompareHighlights;
