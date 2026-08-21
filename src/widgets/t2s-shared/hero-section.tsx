import Container from "@/components/site/container";
import SiteButton from "@/components/site/site-button";
import SiteImage from "@/components/site/site-image";
import Badge from "@/components/site/t2s/badge";
import CheckList from "@/components/site/t2s/check-list";
import StarRating from "@/components/site/t2s/star-rating";
import { isDarkTone, toneStyle, type Tone } from "@/components/site/t2s/panel";
import { cn } from "@/lib/utils";
import type { ButtonItem } from "@/widgets/lib";
import type { MediaRef } from "@/widgets/lib";

export type HeroSectionProps = {
  badge?: string;
  title: string;
  description?: string;
  buttons: ButtonItem[];
  ratingLabel?: string;
  rating: number;
  ratingSuffix?: string;
  stats: { value: string; label: string }[];
  features: { text: string }[];
  image?: MediaRef;
  banner: "contained" | "full";
  backgroundImage?: MediaRef;
  tone: Tone;
};

const HeroSection = ({
  badge,
  title,
  description,
  buttons,
  ratingLabel,
  rating,
  ratingSuffix,
  stats,
  features,
  image,
  banner,
  backgroundImage,
  tone,
}: HeroSectionProps) => {
  const dark = isDarkTone(tone);

  return (
    <section
      className={cn("relative overflow-hidden pt-10 md:pt-16", dark && "pp-on-dark", tone === "surface" && "pp-bg-surface")}
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
            <div className="mt-6 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row sm:gap-5">
              {buttons.map((button, i) => (
                <SiteButton key={i} button={button} size="lg" className="w-full sm:w-auto" />
              ))}
            </div>
          ) : null}

          {ratingLabel || stats.length > 0 ? (
            <div className="mt-8 flex flex-wrap items-start justify-center gap-x-10 gap-y-6 md:mt-10">
              {ratingLabel ? (
                <div className="flex flex-col items-center gap-2 sm:items-start">
                  <span className="pp-heading text-xl font-medium">{ratingLabel}</span>
                  <div className="flex items-center gap-2">
                    <StarRating rating={rating} className="h-4 w-4" />
                    {ratingSuffix ? <span className="text-sm font-semibold">{ratingSuffix}</span> : null}
                  </div>
                </div>
              ) : null}
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 sm:items-start">
                  <span className="pp-heading text-xl font-medium">{stat.value}</span>
                  <span className="pp-muted text-sm">{stat.label}</span>
                </div>
              ))}
            </div>
          ) : null}

          <CheckList items={features} align="center" className="mt-7" />
        </div>
      </Container>

      {image?.url ? (
        banner === "full" ? (
          <div className="mt-10 w-full md:mt-14">
            <SiteImage media={image} priority sizes="100vw" className="h-auto w-full select-none" />
          </div>
        ) : (
          <Container className="mt-10 md:mt-14">
            <SiteImage
              media={image}
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="mx-auto h-auto w-full max-w-5xl select-none"
            />
          </Container>
        )
      ) : null}
    </section>
  );
};

export default HeroSection;
