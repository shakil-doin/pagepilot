import CheckList from "@/components/site/t2s/check-list";
import Glyph from "@/components/site/t2s/glyph";
import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import SiteButton from "@/components/site/site-button";
import SiteImage from "@/components/site/site-image";
import type { Props } from "./schema";

const DeepDiveView = ({
  badge,
  title,
  description,
  cards,
  image,
  features,
  buttons,
  tone,
  icons = [],
}: Props & { icons?: (string | null)[] }) => {
  const dark = isDarkTone(tone);

  return (
    <Panel tone={tone}>
      <div className="flex flex-col items-center gap-12 md:gap-16">
        <SectionHead badge={badge} title={title} description={description} align="center" dark={dark} />

        <div className="grid w-full grid-cols-1 items-stretch gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-5">
            {cards.map((card, i) => (
              <div
                key={i}
                className="flex items-start gap-6 rounded-[var(--pp-radius-xl)] px-6 py-8"
                style={{ background: dark ? "rgb(255 255 255 / 0.07)" : "var(--pp-c-surface)" }}
              >
                <span
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--pp-radius-lg)] [&>svg]:h-6 [&>svg]:w-6"
                  style={{
                    background: dark ? "rgb(255 255 255 / 0.12)" : "var(--pp-c-background)",
                    color: "var(--pp-c-primary)",
                  }}
                >
                  <Glyph svg={icons[i]} size={24} />
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="pp-heading text-xl font-semibold">{card.title}</h3>
                  {card.description ? <p className="pp-muted">{card.description}</p> : null}
                </div>
              </div>
            ))}
          </div>

          {image?.url ? (
            <div
              className="relative flex min-h-80 items-end justify-center overflow-hidden rounded-[var(--pp-radius-xl)] pt-12"
              style={{ background: "var(--pp-c-primary)" }}
            >
              <SiteImage
                media={image}
                sizes="(max-width: 1024px) 90vw, 470px"
                className="h-auto w-full max-w-[470px] select-none"
              />
            </div>
          ) : null}
        </div>

        {features.length > 0 || buttons.length > 0 ? (
          <div className="flex flex-col items-center gap-8">
            <CheckList items={features} align="center" />
            <div className="flex flex-wrap justify-center gap-3">
              {buttons.map((button, i) => (
                <SiteButton key={i} button={button} size="lg" />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Panel>
  );
};

export default DeepDiveView;
