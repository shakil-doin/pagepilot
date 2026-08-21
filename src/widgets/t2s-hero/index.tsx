import Container from "@/components/site/container";
import SiteButton from "@/components/site/site-button";
import SiteImage from "@/components/site/site-image";
import CheckList from "@/components/site/t2s/check-list";
import SectionHead from "@/components/site/t2s/section-head";
import StarRating from "@/components/site/t2s/star-rating";
import { isDarkTone, toneStyle } from "@/components/site/t2s/panel";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const T2sHero = ({
  badge,
  title,
  description,
  ratingLabel,
  rating,
  ratingSuffix,
  buttons,
  features,
  image,
  backgroundImage,
  tone,
}: Props) => {
  const dark = isDarkTone(tone);

  return (
    <section
      className={cn("relative overflow-hidden pt-12 md:pt-20", dark && "pp-on-dark", tone === "surface" && "pp-bg-surface")}
      style={toneStyle(tone)}
    >
      {backgroundImage?.url ? (
        <div className="absolute inset-0 -z-10">
          <SiteImage media={backgroundImage} fill sizes="100vw" className="object-cover object-top" />
        </div>
      ) : null}

      <Container>
        <div className="flex flex-col items-center text-center">
          <SectionHead badge={badge} dark={dark} align="center" />
          {ratingLabel || ratingSuffix ? (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              {ratingLabel ? <span className="pp-muted text-sm md:text-base">{ratingLabel}</span> : null}
              <StarRating rating={rating} className="h-4 w-4 md:h-5 md:w-5" />
              {ratingSuffix ? <span className="text-sm font-semibold md:text-base">{ratingSuffix}</span> : null}
            </div>
          ) : null}

          <h1 className="pp-heading mt-4 max-w-4xl leading-tight" style={{ fontSize: "var(--pp-text-h1)" }}>
            {title}
          </h1>
          {description ? <p className="pp-muted mt-5 max-w-3xl text-lg leading-relaxed">{description}</p> : null}

          {buttons.length > 0 ? (
            <div className="mt-7 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row sm:gap-5">
              {buttons.map((button, i) => (
                <SiteButton key={i} button={button} size="lg" className="w-full sm:w-auto" />
              ))}
            </div>
          ) : null}

          <CheckList items={features} align="center" className="mt-7" />
        </div>
      </Container>

      {image?.url ? (
        <Container className="mt-10 md:mt-16">
          <SiteImage
            media={image}
            priority
            sizes="(max-width: 768px) 100vw, 1200px"
            className="h-auto w-full rounded-t-[var(--pp-radius-xl)]"
          />
        </Container>
      ) : null}
    </section>
  );
};

export default T2sHero;
