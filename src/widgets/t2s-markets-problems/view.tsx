import Glyph from "@/components/site/t2s/glyph";
import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import type { Props } from "./schema";

const MarketsProblemsView = ({
  badge,
  title,
  description,
  problems,
  stats,
  tone,
  icons = [],
}: Props & { icons?: (string | null)[] }) => {
  const dark = isDarkTone(tone);

  return (
    <Panel tone={tone}>
      <div className="flex flex-col gap-12 md:gap-16">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between xl:gap-16">
          <div className="xl:w-[48%] xl:shrink-0">
            <SectionHead badge={badge} title={title} description={description} align="left" dark={dark} />
          </div>
          <ul className="flex flex-col gap-5 md:gap-6 xl:w-[45%] xl:shrink-0">
            {problems.map((item, i) => (
              <li key={i} className="flex items-center gap-4">
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--pp-radius-md)] [&>svg]:h-6 [&>svg]:w-6"
                  style={{
                    background: "color-mix(in srgb, var(--pp-c-primary) 14%, transparent)",
                    color: "var(--pp-c-primary)",
                  }}
                >
                  <Glyph svg={icons[i]} size={24} />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="pp-heading text-lg font-semibold md:text-xl">{item.title}</span>
                  {item.subtitle ? <span className="pp-muted text-sm md:text-base">{item.subtitle}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {stats.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-4 rounded-[var(--pp-radius-xl)] border px-8 py-11 text-center"
                style={{
                  background: dark ? "rgb(255 255 255 / 0.07)" : "color-mix(in srgb, var(--pp-c-primary) 7%, transparent)",
                  borderColor: dark ? "rgb(255 255 255 / 0.14)" : "var(--pp-c-border)",
                }}
              >
                <p className="pp-heading text-4xl font-semibold md:text-5xl">{stat.value}</p>
                <span className="flex flex-col items-center gap-1.5">
                  <span className="pp-muted text-lg font-medium">{stat.label}</span>
                  {stat.description ? <span className="pp-muted text-base">{stat.description}</span> : null}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </Panel>
  );
};

export default MarketsProblemsView;
