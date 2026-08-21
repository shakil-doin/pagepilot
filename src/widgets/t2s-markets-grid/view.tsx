import Container from "@/components/site/container";
import Carousel from "@/components/site/t2s/carousel";
import Glyph from "@/components/site/t2s/glyph";
import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import SiteButton from "@/components/site/site-button";
import type { Props } from "./schema";

const MarketsGridView = ({
  badge,
  title,
  description,
  signalLabel,
  signalTime,
  cards,
  tone,
  icons = [],
}: Props & { icons?: (string | null)[] }) => {
  const dark = isDarkTone(tone);

  return (
    <Panel tone={tone} contained={false}>
      <Container>
        <SectionHead badge={badge} title={title} description={description} align="center" dark={dark} />
      </Container>

      <Container className="mt-10 md:mt-16">
        <Carousel dark={dark} itemClassName="w-[86%] sm:w-[60%] md:w-[48%] lg:w-[42%]">
          {cards.map((card, i) => (
            <div
              key={i}
              className="flex h-full flex-col gap-8 rounded-[var(--pp-radius-xl)] p-6 sm:gap-12 sm:px-10 sm:py-12"
              style={{ background: dark ? "rgb(255 255 255 / 0.07)" : "var(--pp-c-surface)" }}
            >
              <div className="flex flex-1 flex-col gap-5">
                <div className="flex flex-1 flex-col gap-8">
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

              <div className="flex flex-col gap-4">
                {card.signalText ? (
                  <div
                    className="flex flex-col gap-1 rounded-[var(--pp-radius-lg)] border p-4"
                    style={{
                      background: dark ? "rgb(255 255 255 / 0.1)" : "var(--pp-c-background)",
                      borderColor: dark ? "rgb(255 255 255 / 0.14)" : "var(--pp-c-border)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="pp-muted text-sm uppercase">{signalLabel}</span>
                      {signalTime ? <span className="pp-muted text-xs">{signalTime}</span> : null}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-base font-medium">{card.signalText}</span>
                      {card.signalStatus ? (
                        <span
                          className="inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-base font-medium text-white"
                          style={{ background: "var(--pp-c-primary)" }}
                        >
                          {card.signalStatus}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {card.chips.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {card.chips.map((chip, j) => (
                      <span
                        key={j}
                        className="rounded-full border px-4 py-1.5 text-base font-medium"
                        style={{
                          borderColor: "color-mix(in srgb, var(--pp-c-primary) 25%, transparent)",
                          background: "color-mix(in srgb, var(--pp-c-primary) 10%, transparent)",
                          color: "var(--pp-c-primary)",
                        }}
                      >
                        {chip.text}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </Carousel>
      </Container>
    </Panel>
  );
};

export default MarketsGridView;
