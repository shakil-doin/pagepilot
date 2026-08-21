import AccentCards from "@/components/site/t2s/accent-cards";
import Glyph from "@/components/site/t2s/glyph";
import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import type { Props } from "./schema";

// icons holds the scenario icons first, then the card icons.
type ViewProps = Props & { icons?: (string | null)[] };

const LanderProblemsView = ({
  badge,
  title,
  description,
  info,
  scenarios,
  ratingScore,
  ratingSource,
  ratingReviews,
  cards,
  tone,
  icons = [],
}: ViewProps) => {
  const dark = isDarkTone(tone);
  const cardIcons = icons.slice(scenarios.length);

  return (
    <Panel tone={tone}>
      <div className="flex flex-col gap-6 md:gap-16">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:gap-16">
          <div className="xl:w-[46%] xl:shrink-0">
            <SectionHead badge={badge} title={title} description={description} align="left" dark={dark} />
            {info ? <p className="pp-heading mt-2 font-semibold">{info}</p> : null}
          </div>

          <div className="flex flex-1 flex-col gap-6 md:gap-12">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {scenarios.map((scenario, i) => (
                <div key={i} className="flex gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--pp-radius-md)] md:h-12 md:w-12"
                    style={{
                      background: "color-mix(in srgb, var(--pp-c-primary) 12%, transparent)",
                      color: "var(--pp-c-primary)",
                    }}
                  >
                    <Glyph svg={icons[i]} size={22} />
                  </span>
                  <div className="flex flex-col gap-1">
                    <p className="pp-heading text-base font-medium md:text-xl">{scenario.title}</p>
                    {scenario.subtitle ? <p className="pp-muted text-sm md:text-base">{scenario.subtitle}</p> : null}
                  </div>
                </div>
              ))}
            </div>

            {ratingScore || ratingSource ? (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="flex items-center gap-1" aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} viewBox="0 0 24 24" className="h-4 w-4 md:h-6 md:w-6" fill="#E87E04">
                      <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
                    </svg>
                  ))}
                </span>
                {ratingScore ? <span className="text-sm font-bold md:text-xl">{ratingScore}</span> : null}
                {ratingSource ? <span className="pp-muted text-xs md:text-base">{ratingSource}</span> : null}
                {ratingReviews ? <span className="text-xs md:text-base">{ratingReviews}</span> : null}
              </div>
            ) : null}
          </div>
        </div>

        <AccentCards items={cards} icons={cardIcons} accent="danger" columns={4} />
      </div>
    </Panel>
  );
};

export default LanderProblemsView;
