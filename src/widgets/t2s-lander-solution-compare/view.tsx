import Glyph from "@/components/site/t2s/glyph";
import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import SiteButton from "@/components/site/site-button";
import SiteImage from "@/components/site/site-image";
import type { Props } from "./schema";

const ACCENT = {
  primary: "var(--pp-c-primary)",
  warning: "var(--pp-warning, #d97706)",
  danger: "var(--pp-danger, #dc2626)",
} as const;

const SolutionCompareView = ({
  badge,
  title,
  description,
  flowImage,
  withoutBadge,
  withoutTitle,
  withoutText,
  withoutTag,
  withoutCards,
  withBadge,
  withTitle,
  withText,
  withTag,
  logTitle,
  logStatus,
  rows,
  stats,
  footerText,
  buttons,
  tone,
  rounded,
  icons = [],
}: Props & { icons?: (string | null)[] }) => {
  const dark = isDarkTone(tone);
  const panelBorder = dark ? "rgb(255 255 255 / 0.12)" : "var(--pp-c-border)";

  return (
    <Panel tone={tone} rounded={rounded}>
      <div className="flex flex-col items-center gap-10 md:gap-14">
        <SectionHead badge={badge} title={title} description={description} align="center" dark={dark} />

        {flowImage?.url ? (
          <SiteImage media={flowImage} sizes="(max-width: 768px) 100vw, 640px" className="h-auto w-full max-w-2xl" />
        ) : null}

        <div className="flex w-full max-w-5xl flex-col gap-6">
          <div className="grid grid-cols-1 overflow-hidden rounded-[var(--pp-radius-xl)] lg:grid-cols-2">
            {/* Manual side: alert cards deliberately stacked and tilted. */}
            <div
              className="flex flex-col px-5 pb-10 pt-8 md:px-8"
              style={{ background: `color-mix(in srgb, var(--pp-danger, #dc2626) 10%, transparent)` }}
            >
              <span
                className="inline-flex w-fit rounded-[var(--pp-radius-md)] px-3 py-1 text-sm md:text-base"
                style={{
                  background: `color-mix(in srgb, var(--pp-danger, #dc2626) 18%, transparent)`,
                  color: "var(--pp-danger, #dc2626)",
                }}
              >
                {withoutBadge}
              </span>
              <h3 className="pp-heading mt-6 text-lg font-semibold md:text-xl">{withoutTitle}</h3>
              {withoutText ? <p className="pp-muted mt-1.5 text-sm md:text-base">{withoutText}</p> : null}

              <div className="relative mt-8 h-72 w-full md:h-64">
                {withoutCards.map((card, i) => (
                  <div
                    key={i}
                    className="absolute flex w-[88%] max-w-[420px] items-center gap-3 rounded-[var(--pp-radius-lg)] border px-4 py-3 backdrop-blur-sm"
                    style={{
                      left: `${card.left}%`,
                      top: `${card.top}%`,
                      transform: `rotate(${card.tilt}deg)`,
                      background: dark ? "rgb(255 255 255 / 0.15)" : "var(--pp-c-background)",
                      borderColor: panelBorder,
                    }}
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white [&>svg]:h-5 [&>svg]:w-5"
                      style={{ background: ACCENT[card.accent] }}
                    >
                      <Glyph svg={icons[i]} size={20} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold uppercase md:text-base">{card.label}</span>
                      {card.text ? (
                        <span className="mt-0.5 block truncate text-sm md:text-base" style={{ color: ACCENT[card.accent] }}>
                          {card.text}
                        </span>
                      ) : null}
                    </span>
                  </div>
                ))}
                {withoutTag ? (
                  <span
                    className="absolute bottom-0 right-0 z-10 rounded-[var(--pp-radius-md)] px-3 py-1.5 text-sm font-medium text-white md:text-base"
                    style={{ background: "var(--pp-danger, #dc2626)" }}
                  >
                    {withoutTag}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Automated side: one tidy trade log. */}
            <div
              className="flex flex-col px-5 pb-10 pt-8 md:px-8"
              style={{ background: dark ? "rgb(255 255 255 / 0.16)" : "var(--pp-c-surface)" }}
            >
              <span
                className="inline-flex w-fit rounded-[var(--pp-radius-md)] px-3 py-1 text-sm font-medium md:text-base"
                style={{
                  background: "color-mix(in srgb, var(--pp-c-primary) 15%, transparent)",
                  color: "var(--pp-c-primary)",
                }}
              >
                {withBadge}
              </span>
              <h3 className="pp-heading mt-6 text-lg font-semibold md:text-xl">{withTitle}</h3>
              {withText ? <p className="pp-muted mt-1.5 text-sm md:text-base">{withText}</p> : null}

              <div className="relative mt-6">
                <div
                  className="rounded-[var(--pp-radius-lg)] border px-4 py-4"
                  style={{ background: dark ? "rgb(255 255 255 / 0.14)" : "var(--pp-c-background)", borderColor: panelBorder }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium md:text-base">{logTitle}</span>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-medium md:text-base"
                      style={{
                        background: "color-mix(in srgb, var(--pp-success, #16a34a) 15%, transparent)",
                        color: "var(--pp-success, #16a34a)",
                      }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--pp-success, #16a34a)" }} />
                      {logStatus}
                    </span>
                  </div>
                  <ul className="mt-3">
                    {rows.map((row, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between border-b py-2.5 last:border-b-0"
                        style={{ borderColor: panelBorder }}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-sm font-medium md:text-base">{row.symbol}</span>
                          <span
                            className="rounded-[var(--pp-radius-sm)] px-1.5 py-0.5 text-xs font-medium"
                            style={
                              row.side === "BUY"
                                ? {
                                    background: "color-mix(in srgb, var(--pp-c-primary) 15%, transparent)",
                                    color: "var(--pp-c-primary)",
                                  }
                                : {
                                    background: "color-mix(in srgb, var(--pp-danger, #dc2626) 15%, transparent)",
                                    color: "var(--pp-danger, #dc2626)",
                                  }
                            }
                          >
                            {row.side}
                          </span>
                        </span>
                        <span className="text-sm font-medium md:text-base" style={{ color: "var(--pp-success, #16a34a)" }}>
                          {row.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                {withTag ? (
                  <span
                    className="absolute -bottom-3 right-4 z-10 inline-flex items-center rounded-[var(--pp-radius-md)] px-3 py-1.5 text-sm font-medium text-white md:text-base"
                    style={{ background: "var(--pp-c-primary)" }}
                  >
                    {withTag}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {stats.length > 0 ? (
            <ul className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-10">
              {stats.map((stat, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span aria-hidden className="mt-2.5 h-2 w-2 shrink-0 rounded-full" style={{ background: "var(--pp-c-primary)" }} />
                  <div>
                    <p className="text-base md:text-lg">
                      <span className="font-semibold" style={{ color: "var(--pp-c-primary)" }}>
                        {stat.value}
                      </span>{" "}
                      <span className="font-semibold">{stat.label}</span>
                    </p>
                    {stat.text ? <p className="pp-muted text-xs md:text-sm">{stat.text}</p> : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {footerText || buttons.length > 0 ? (
          <div className="flex flex-col items-center gap-5 text-center">
            {footerText ? <p className="pp-muted text-lg md:text-2xl">{footerText}</p> : null}
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

export default SolutionCompareView;
