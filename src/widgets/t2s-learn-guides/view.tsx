import Glyph from "@/components/site/t2s/glyph";
import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import SiteButton from "@/components/site/site-button";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const LearnGuidesView = ({
  badge,
  title,
  description,
  columns,
  cards,
  tone,
  icons = [],
}: Props & { icons?: (string | null)[] }) => {
  const dark = isDarkTone(tone);

  return (
    <Panel tone={tone}>
      <div className="flex flex-col gap-10 md:gap-16">
        <SectionHead badge={badge} title={title} description={description} align="center" dark={dark} />

        <div
          className={cn("mx-auto grid w-full gap-6", {
            "lg:grid-cols-1": columns === 1,
            "lg:grid-cols-2": columns === 2,
            "lg:grid-cols-3": columns === 3,
          })}
        >
          {cards.map((card, i) => (
            <div
              key={i}
              className="flex h-full flex-col justify-between gap-5 rounded-[var(--pp-radius-xl)] p-6 sm:px-10 sm:py-12"
              style={{ background: dark ? "rgb(255 255 255 / 0.07)" : "var(--pp-c-surface)" }}
            >
              <div className="flex flex-col gap-8">
                <span
                  className="grid h-16 w-16 shrink-0 place-items-center rounded-[var(--pp-radius-lg)] [&>svg]:h-6 [&>svg]:w-6"
                  style={{
                    background: dark ? "rgb(255 255 255 / 0.12)" : "var(--pp-c-background)",
                    color: "var(--pp-c-primary)",
                  }}
                >
                  <Glyph svg={icons[i]} size={24} />
                </span>

                <div className="flex flex-col gap-3">
                  <h3 className="pp-heading text-2xl font-semibold sm:text-3xl">{card.title}</h3>
                  {card.description ? <p className="pp-muted text-base">{card.description}</p> : null}
                  {card.items.length > 0 ? (
                    <ul className="flex flex-col gap-1.5 pt-2">
                      {card.items.map((item, j) => (
                        <li key={j} className="pp-muted flex items-start gap-2 text-base">
                          <svg
                            viewBox="0 0 20 20"
                            className="mt-1 h-5 w-5 shrink-0"
                            fill="none"
                            stroke="var(--pp-success, #16a34a)"
                            strokeWidth="3"
                            aria-hidden
                          >
                            <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {item.text}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>

              {card.buttons.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {card.buttons.map((button, j) => (
                    <SiteButton key={j} button={button} />
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
};

export default LearnGuidesView;
