import Glyph from "@/components/site/t2s/glyph";
import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import SiteImage from "@/components/site/site-image";
import { cn } from "@/lib/utils";
import type { CardItem } from "@/widgets/t2s-lib";
import type { Props } from "./schema";

type ViewProps = Props & { icons?: (string | null)[] };

const Card = ({ card, svg, dark }: { card: CardItem; svg?: string | null; dark: boolean }) => (
  <div
    className="flex h-full flex-col rounded-[var(--pp-radius-lg)] p-6 md:p-7"
    style={{ background: dark ? "rgb(255 255 255 / 0.08)" : "var(--pp-c-surface)" }}
  >
    <Glyph svg={svg} tone="solid" size={14} className="mb-6" />
    <h3 className="pp-heading mt-auto text-lg font-bold leading-tight md:text-xl">{card.title}</h3>
    {card.description ? <p className="pp-muted mt-2 leading-relaxed">{card.description}</p> : null}
  </div>
);

// Two cards, the device shot, then two more. On narrow screens everything
// stacks in reading order.
const MobileFeatureView = ({ badge, title, description, align, cards, image, tone, icons = [] }: ViewProps) => {
  const dark = isDarkTone(tone);
  const left = cards.slice(0, 2);
  const right = cards.slice(2, 4);
  const rest = cards.slice(4);

  return (
    <Panel tone={tone}>
      <SectionHead badge={badge} title={title} description={description} align={align} dark={dark} />

      <div className="mt-8 grid gap-4 md:mt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-6">
        <div className="grid gap-4 lg:gap-6">
          {left.map((card, i) => (
            <Card key={i} card={card} svg={icons[i]} dark={dark} />
          ))}
        </div>

        <div
          className={cn(
            "flex items-center justify-center overflow-hidden rounded-[var(--pp-radius-xl)] p-6",
            !image?.url && "min-h-[280px]",
          )}
          style={{ background: dark ? "rgb(255 255 255 / 0.06)" : "var(--pp-c-surface)" }}
        >
          {image?.url ? (
            <SiteImage
              media={image}
              sizes="(max-width: 1024px) 100vw, 420px"
              className="h-auto max-h-[640px] w-auto object-contain"
            />
          ) : null}
        </div>

        <div className="grid gap-4 lg:gap-6">
          {right.map((card, i) => (
            <Card key={i} card={card} svg={icons[i + 2]} dark={dark} />
          ))}
        </div>
      </div>

      {rest.length > 0 ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {rest.map((card, i) => (
            <Card key={i} card={card} svg={icons[i + 4]} dark={dark} />
          ))}
        </div>
      ) : null}
    </Panel>
  );
};

export default MobileFeatureView;
