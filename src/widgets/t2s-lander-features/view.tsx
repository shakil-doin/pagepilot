import Glyph from "@/components/site/t2s/glyph";
import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import SiteImage from "@/components/site/site-image";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const LanderFeaturesView = ({
  badge,
  title,
  description,
  columns,
  items,
  recognitionTitle,
  badges,
  tone,
  icons = [],
}: Props & { icons?: (string | null)[] }) => {
  const dark = isDarkTone(tone);

  return (
    <Panel tone={tone}>
      <div className="flex flex-col items-center gap-10 md:gap-16">
        <SectionHead badge={badge} title={title} description={description} align="center" dark={dark} />

        <div
          className={cn("grid w-full grid-cols-1 gap-6 sm:grid-cols-2", {
            "lg:grid-cols-2": columns === 2,
            "lg:grid-cols-3": columns === 3,
            "lg:grid-cols-4": columns === 4,
          })}
        >
          {items.map((item, i) => (
            <div
              key={i}
              className="flex h-full flex-col gap-6 rounded-[var(--pp-radius-lg)] p-6"
              style={{ background: dark ? "rgb(255 255 255 / 0.07)" : "var(--pp-c-surface)" }}
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--pp-radius-md)] text-white [&>svg]:h-5 [&>svg]:w-5"
                style={{ background: "var(--pp-c-primary)" }}
              >
                <Glyph svg={icons[i]} size={20} />
              </span>
              <div className="flex flex-col gap-2">
                <h3 className="pp-heading text-lg font-bold">{item.title}</h3>
                {item.description ? <p className="pp-muted text-sm leading-6">{item.description}</p> : null}
              </div>
            </div>
          ))}
        </div>

        {badges.length > 0 ? (
          <div className="flex flex-col items-center gap-6">
            {recognitionTitle ? (
              <h3 className="pp-heading text-center text-base font-semibold md:text-lg">{recognitionTitle}</h3>
            ) : null}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {badges.map((item, i) => {
                const image = item.image?.url ? (
                  <SiteImage
                    media={item.image}
                    sizes="180px"
                    className="h-auto w-36 max-w-full rounded-[var(--pp-radius-lg)] bg-white md:w-40"
                  />
                ) : (
                  <span className="pp-muted text-sm">{item.label}</span>
                );

                return item.link?.href ? (
                  <a
                    key={i}
                    href={item.link.href}
                    target={item.link.newTab ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="inline-flex"
                  >
                    {image}
                  </a>
                ) : (
                  <span key={i} className="inline-flex">
                    {image}
                  </span>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </Panel>
  );
};

export default LanderFeaturesView;
