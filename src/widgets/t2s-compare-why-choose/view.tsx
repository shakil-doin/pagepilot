import CheckList from "@/components/site/t2s/check-list";
import Glyph from "@/components/site/t2s/glyph";
import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import SiteButton from "@/components/site/site-button";
import SiteImage from "@/components/site/site-image";
import { cn } from "@/lib/utils";
import type { CardItem } from "@/widgets/t2s-lib";
import type { Props } from "./schema";

const WhyCard = ({ card, svg, dark, className }: { card: CardItem; svg?: string | null; dark: boolean; className?: string }) => (
  <div
    className={cn("flex flex-col gap-6 rounded-[var(--pp-radius-xl)] p-6 sm:px-6 sm:py-8", className)}
    style={{ background: dark ? "rgb(255 255 255 / 0.07)" : "var(--pp-c-surface)" }}
  >
    <span
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--pp-radius-lg)] [&>svg]:h-6 [&>svg]:w-6"
      style={{ background: dark ? "rgb(255 255 255 / 0.12)" : "var(--pp-c-background)", color: "var(--pp-c-primary)" }}
    >
      <Glyph svg={svg} size={24} />
    </span>
    <div className="flex flex-col gap-2">
      <h3 className="pp-heading text-xl font-medium">{card.title}</h3>
      {card.description ? <p className="pp-muted">{card.description}</p> : null}
    </div>
  </div>
);

const Showcase = ({ image, className }: { image: NonNullable<Props["image"]>; className?: string }) => (
  <div
    className={cn("relative flex min-h-80 items-end justify-center overflow-hidden rounded-[var(--pp-radius-xl)] pt-12", className)}
    style={{ background: "var(--pp-c-primary)" }}
  >
    <SiteImage media={image} sizes="(max-width: 1024px) 90vw, 470px" className="h-auto w-full max-w-[470px] select-none" />
  </div>
);

const WhyChooseView = ({
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
  const [first, second, third, fourth, fifth] = cards;

  return (
    <Panel tone={tone}>
      <div className="flex flex-col items-center gap-12 md:gap-16">
        <SectionHead badge={badge} title={title} description={description} align="center" dark={dark} />

        {image?.url ? (
          <div className="grid w-full grid-cols-1 gap-5 lg:grid-cols-[1fr_1.4fr_1.08fr]">
            <div className="flex flex-col gap-5">
              {first ? <WhyCard card={first} svg={icons[0]} dark={dark} className="flex-1" /> : null}
              {second ? <WhyCard card={second} svg={icons[1]} dark={dark} className="flex-1" /> : null}
            </div>
            <div className="flex flex-col gap-5">
              {third ? <WhyCard card={third} svg={icons[2]} dark={dark} /> : null}
              <Showcase image={image} className="flex-1" />
            </div>
            <div className="flex flex-col gap-5">
              {fourth ? <WhyCard card={fourth} svg={icons[3]} dark={dark} className="flex-1" /> : null}
              {fifth ? <WhyCard card={fifth} svg={icons[4]} dark={dark} className="flex-1" /> : null}
            </div>
          </div>
        ) : (
          <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card, i) => (
              <WhyCard key={i} card={card} svg={icons[i]} dark={dark} />
            ))}
          </div>
        )}

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

export default WhyChooseView;
