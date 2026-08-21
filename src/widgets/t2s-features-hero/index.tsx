import { Fragment } from "react";
import Container from "@/components/site/container";
import SiteButton from "@/components/site/site-button";
import SiteImage from "@/components/site/site-image";
import Badge from "@/components/site/t2s/badge";
import { isDarkTone, toneStyle } from "@/components/site/t2s/panel";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const T2sFeaturesHero = ({
  badge,
  title,
  description,
  buttons,
  stats,
  platformNote,
  platforms,
  backgroundImage,
  tone,
}: Props) => {
  const dark = isDarkTone(tone);

  return (
    <section
      className={cn(
        "relative flex flex-col items-center overflow-hidden pb-12 pt-10 md:pb-16 md:pt-16",
        dark && "pp-on-dark",
        tone === "surface" && "pp-bg-surface",
      )}
      style={toneStyle(tone)}
    >
      {backgroundImage?.url ? (
        <div aria-hidden className="absolute inset-0 -z-10">
          <SiteImage media={backgroundImage} fill sizes="100vw" className="object-cover object-top" />
        </div>
      ) : null}

      <Container>
        <div className="flex flex-col items-center text-center">
          {badge ? <Badge tone={dark ? "dark" : "light"}>{badge}</Badge> : null}
          <h1 className="pp-heading mt-4 max-w-4xl leading-tight" style={{ fontSize: "var(--pp-text-h1)" }}>
            {title}
          </h1>
          {description ? <p className="pp-muted mt-4 max-w-3xl leading-relaxed">{description}</p> : null}

          {buttons.length > 0 ? (
            <div className="mt-6 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row md:mt-8">
              {buttons.map((button, i) => (
                <SiteButton key={i} button={button} size="lg" className="w-full sm:w-auto" />
              ))}
            </div>
          ) : null}

          {stats.length > 0 ? (
            <div
              className="mt-10 flex w-full max-w-2xl items-stretch justify-center divide-x md:mt-14"
              style={{ borderColor: "var(--pp-c-border)" }}
            >
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5 px-3 md:px-8">
                  <span className="text-3xl font-semibold md:text-5xl" style={{ color: "var(--pp-c-primary)" }}>
                    {stat.value}
                  </span>
                  <span className="pp-muted text-xs uppercase tracking-wide md:text-sm">{stat.label}</span>
                </div>
              ))}
            </div>
          ) : null}

          {platforms.length > 0 || platformNote ? (
            <p className="pp-muted mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm md:mt-10">
              {platformNote ? <span className="pp-heading font-medium">{platformNote}</span> : null}
              {platforms.map((platform, i) => (
                <Fragment key={i}>
                  {i > 0 ? <span aria-hidden>·</span> : null}
                  <span>{platform.text}</span>
                </Fragment>
              ))}
            </p>
          ) : null}
        </div>
      </Container>
    </section>
  );
};

export default T2sFeaturesHero;
