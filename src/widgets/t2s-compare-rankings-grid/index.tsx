import Link from "next/link";
import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import SiteButton from "@/components/site/site-button";
import StarRating from "@/components/site/t2s/star-rating";
import type { Competitor, Props } from "./schema";

const Tick = () => (
  <svg
    viewBox="0 0 20 20"
    className="mt-1 h-5 w-5 shrink-0"
    fill="none"
    stroke="var(--pp-success, #16a34a)"
    strokeWidth="3"
    aria-hidden
  >
    <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CompetitorCard = ({ competitor, dark }: { competitor: Competitor; dark: boolean }) => (
  <div
    className="flex flex-col gap-4 rounded-[var(--pp-radius-xl)] border p-6 md:p-8"
    style={{
      background: dark ? "rgb(255 255 255 / 0.06)" : "var(--pp-c-background)",
      borderColor: dark ? "rgb(255 255 255 / 0.14)" : "var(--pp-c-border)",
    }}
  >
    <div className="flex flex-col gap-2">
      <StarRating rating={competitor.rating} className="h-5 w-5" />
      <h3 className="pp-heading text-xl font-semibold">{competitor.name}</h3>
    </div>
    <ul className="flex flex-col gap-1.5 pt-2">
      {competitor.items.map((item, i) => (
        <li key={i} className="pp-muted flex items-start gap-2.5 text-base">
          <Tick />
          <span>{item.text}</span>
        </li>
      ))}
    </ul>
    <Link
      href={competitor.link.href}
      target={competitor.link.newTab ? "_blank" : undefined}
      rel={competitor.link.newTab ? "noopener noreferrer" : undefined}
      className="mt-auto flex w-fit items-center gap-1.5 text-base font-medium"
      style={{ color: "var(--pp-c-primary)" }}
    >
      {competitor.linkLabel} →
    </Link>
  </div>
);

const T2sCompareRankingsGrid = ({
  badge,
  title,
  description,
  featuredName,
  featuredBadge,
  featuredTagline,
  featuredItems,
  featuredButtons,
  competitors,
  tone,
}: Props) => {
  const dark = isDarkTone(tone);
  const left = competitors.slice(0, 2);
  const right = competitors.slice(2, 4);

  return (
    <Panel tone={tone}>
      <div className="flex flex-col items-center gap-8 md:gap-14">
        <SectionHead badge={badge} title={title} description={description} align="center" dark={dark} />

        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-[1fr_1.9fr_1fr] lg:items-stretch">
          <div className="order-2 flex flex-col gap-5 lg:order-1 lg:gap-6">
            {left.map((competitor, i) => (
              <CompetitorCard key={i} competitor={competitor} dark={dark} />
            ))}
          </div>

          <div
            className="order-1 flex h-full flex-col justify-between gap-8 rounded-[var(--pp-radius-xl)] p-6 md:p-8 lg:order-2"
            style={{ background: dark ? "rgb(255 255 255 / 0.1)" : "var(--pp-c-surface)" }}
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="pp-heading text-3xl font-semibold md:text-4xl">{featuredName}</h3>
                  {featuredBadge ? (
                    <span
                      className="inline-flex items-center rounded-full px-5 py-1.5 text-base font-medium text-white"
                      style={{ background: "var(--pp-c-primary)" }}
                    >
                      {featuredBadge}
                    </span>
                  ) : null}
                </div>
                {featuredTagline ? <p className="pp-muted text-lg">{featuredTagline}</p> : null}
              </div>

              <ul className="flex flex-col gap-2">
                {featuredItems.map((item, i) => (
                  <li key={i} className="pp-muted flex items-start gap-2.5 text-base">
                    <Tick />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {featuredButtons.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {featuredButtons.map((button, i) => (
                  <SiteButton key={i} button={button} size="lg" />
                ))}
              </div>
            ) : null}
          </div>

          <div className="order-3 flex flex-col gap-5 lg:gap-6">
            {right.map((competitor, i) => (
              <CompetitorCard key={i} competitor={competitor} dark={dark} />
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
};

export default T2sCompareRankingsGrid;
