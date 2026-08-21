import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import type { Props } from "./schema";

const T2sLearnChoose = ({ badge, title, description, cards, tone }: Props) => {
  const dark = isDarkTone(tone);

  return (
    <Panel tone={tone}>
      <div className="flex flex-col items-center gap-10 md:gap-16">
        <SectionHead badge={badge} title={title} description={description} align="center" dark={dark} />

        <div className="flex w-full flex-col items-stretch gap-6 md:flex-row md:gap-8">
          {cards.map((card, i) => (
            <div
              key={i}
              className="flex-1 rounded-[var(--pp-radius-xl)] p-2.5"
              style={{ background: dark ? "rgb(255 255 255 / 0.08)" : "var(--pp-c-surface)" }}
            >
              <div
                className="pp-on-dark flex h-full flex-col items-start gap-4 overflow-hidden rounded-[var(--pp-radius-lg)] p-6 md:p-8"
                style={{
                  background: card.accent === "primary" ? "var(--pp-c-primary)" : "var(--pp-c-secondary)",
                }}
              >
                {card.badge ? (
                  <span
                    className="inline-flex items-center rounded-full px-4 py-2 text-sm"
                    style={{ background: "#fff", color: "var(--pp-c-textMuted)" }}
                  >
                    {card.badge}
                  </span>
                ) : null}
                <h3 className="pp-heading text-xl font-semibold md:text-2xl">{card.title}</h3>
                {card.text ? <p className="pp-muted text-base leading-6">{card.text}</p> : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
};

export default T2sLearnChoose;
