import Glyph from "@/components/site/t2s/glyph";
import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SiteImage from "@/components/site/site-image";
import type { Props } from "./schema";

const AboutHeroView = ({
  titleLines,
  logo,
  introHeading,
  badges,
  sideImage,
  columns,
  tone,
  icons = [],
}: Props & { icons?: (string | null)[] }) => {
  const dark = isDarkTone(tone);

  return (
    <Panel tone={tone}>
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-3 lg:gap-12">
        <div className="lg:col-span-2">
          <h1 className="pp-heading leading-tight" style={{ fontSize: "var(--pp-text-h1)" }}>
            {titleLines.map((line, i) => (
              <span key={i} className="block">
                {line.text}
              </span>
            ))}
          </h1>

          {introHeading || logo?.url || badges.length > 0 ? (
            <div className="mt-10 flex flex-col items-center gap-3 text-center md:flex-row md:items-start md:gap-4 md:text-left">
              {logo?.url ? (
                <SiteImage media={logo} sizes="64px" className="h-14 w-14 shrink-0 rounded-full object-cover" />
              ) : null}
              <div>
                {introHeading ? <p className="pp-heading text-base font-medium md:text-lg">{introHeading}</p> : null}
                {badges.length > 0 ? (
                  <div className="mt-3 flex flex-wrap justify-center gap-2.5 md:justify-start">
                    {badges.map((badge, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm"
                        style={{
                          borderColor: "color-mix(in srgb, var(--pp-c-primary) 25%, transparent)",
                          background: "color-mix(in srgb, var(--pp-c-primary) 10%, transparent)",
                          color: "var(--pp-c-primary)",
                        }}
                      >
                        <Glyph svg={icons[i]} size={14} />
                        {badge.label}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        {sideImage?.url ? (
          <div className="hidden justify-center lg:flex">
            <SiteImage media={sideImage} sizes="180px" className="h-auto w-32 object-contain" />
          </div>
        ) : null}
      </div>

      {columns.length > 0 ? (
        <div className="mt-10 grid gap-8 md:mt-14 md:grid-cols-2 md:gap-16">
          {columns.map((column, i) => (
            <p key={i} className={dark ? "leading-relaxed" : "pp-muted leading-relaxed"}>
              {column.text}
            </p>
          ))}
        </div>
      ) : null}
    </Panel>
  );
};

export default AboutHeroView;
