import Glyph from "@/components/site/t2s/glyph";
import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import SiteButton from "@/components/site/site-button";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const ToolsCalculatorsView = ({
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
      <div className="flex flex-col items-center gap-10 md:gap-14">
        <SectionHead badge={badge} title={title} description={description} align="center" dark={dark} />

        <div
          className={cn("mx-auto grid w-full max-w-5xl gap-6", {
            "md:grid-cols-1": columns === 1,
            "md:grid-cols-2": columns === 2,
            "md:grid-cols-2 lg:grid-cols-3": columns === 3,
          })}
        >
          {cards.map((card, i) => (
            <div
              key={i}
              className="flex flex-col items-start rounded-[var(--pp-radius-xl)] border p-7 transition-transform hover:-translate-y-0.5 sm:p-8"
              style={{
                background: dark ? "rgb(255 255 255 / 0.07)" : "var(--pp-c-background)",
                borderColor: dark ? "rgb(255 255 255 / 0.14)" : "var(--pp-c-border)",
              }}
            >
              <span
                className="mb-4 grid h-12 w-12 place-items-center rounded-[var(--pp-radius-md)] text-white [&>svg]:h-5 [&>svg]:w-5"
                style={{ background: "var(--pp-c-primary)" }}
              >
                <Glyph svg={icons[i]} size={20} />
              </span>
              <h3 className="pp-heading mb-2 text-xl font-bold">{card.title}</h3>
              {card.description ? <p className="pp-muted mb-6 flex-1 text-[15px]">{card.description}</p> : null}
              {card.buttons.length > 0 ? (
                <div className="mt-auto flex flex-wrap gap-3">
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

export default ToolsCalculatorsView;
