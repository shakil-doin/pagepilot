import AccentCards from "@/components/site/t2s/accent-cards";
import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import type { Props } from "./schema";

const LanderSolutionsView = ({
  badge,
  title,
  description,
  info,
  columns,
  solutions,
  stats,
  tone,
  icons = [],
}: Props & { icons?: (string | null)[] }) => {
  const dark = isDarkTone(tone);

  return (
    <Panel tone={tone}>
      <div className="flex flex-col items-center gap-10 md:gap-20">
        <div className="flex w-full flex-col items-center gap-8 md:gap-14">
          <div className="flex flex-col items-center">
            <SectionHead badge={badge} title={title} description={description} align="center" dark={dark} />
            {info ? <p className="pp-heading mt-4 text-center font-semibold">{info}</p> : null}
          </div>
          <AccentCards items={solutions} icons={icons} accent="success" columns={columns} leftBar className="w-full" />
        </div>

        {stats.length > 0 ? (
          <div className="grid w-full grid-cols-2 gap-4 xl:grid-cols-4 xl:gap-6">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-4 rounded-[var(--pp-radius-lg)] border p-4 text-center md:p-10"
                style={{
                  background: "color-mix(in srgb, var(--pp-c-primary) 7%, transparent)",
                  borderColor: "color-mix(in srgb, var(--pp-c-primary) 22%, transparent)",
                }}
              >
                <p className="pp-heading text-2xl font-semibold md:text-5xl" style={{ color: "var(--pp-c-primary)" }}>
                  {stat.value}
                </p>
                <div className="flex flex-col gap-1.5">
                  <p className="pp-muted text-sm font-medium md:text-xl">{stat.label}</p>
                  {stat.sublabel ? <p className="pp-muted text-xs md:text-lg">{stat.sublabel}</p> : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </Panel>
  );
};

export default LanderSolutionsView;
