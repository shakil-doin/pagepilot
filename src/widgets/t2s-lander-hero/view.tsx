import Container from "@/components/site/container";
import Glyph from "@/components/site/t2s/glyph";
import SiteImage from "@/components/site/site-image";
import { isDarkTone, toneStyle } from "@/components/site/t2s/panel";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const Star = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 md:h-6 md:w-6" fill={filled ? "#E87E04" : "none"} stroke="#E87E04" strokeWidth="1.5" aria-hidden>
    <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" strokeLinejoin="round" />
  </svg>
);

const LanderHeroView = ({
  ratingScore,
  ratingSource,
  ratingStars,
  titleLines,
  intro,
  avatars,
  socialProofText,
  features,
  bannerDesktop,
  bannerMobile,
  backgroundImage,
  tone,
  icons = [],
}: Props & { icons?: (string | null)[] }) => {
  const dark = isDarkTone(tone);

  return (
    <section
      className={cn("relative isolate overflow-hidden", dark && "pp-on-dark", tone === "surface" && "pp-bg-surface")}
      style={toneStyle(tone)}
    >
      {backgroundImage?.url ? (
        <div aria-hidden className="absolute inset-0 -z-10">
          <SiteImage media={backgroundImage} fill sizes="100vw" className="object-cover object-top" />
        </div>
      ) : null}

      <Container>
        <div className="flex flex-col items-center pt-8 text-center md:pt-16">
          {ratingScore || ratingSource ? (
            <div className="flex items-center gap-2 md:gap-4">
              <span className="flex items-center gap-0.5 md:gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} filled={i < ratingStars} />
                ))}
              </span>
              {ratingScore ? <span className="text-xs font-bold md:text-xl">{ratingScore}</span> : null}
              {ratingSource ? <span className="pp-muted text-xs md:text-base">{ratingSource}</span> : null}
            </div>
          ) : null}

          <h1 className="pp-heading mt-3 leading-tight md:mt-6" style={{ fontSize: "var(--pp-text-h1)" }}>
            {titleLines.map((line, i) => (
              <span key={i} className="block">
                {line.text}
              </span>
            ))}
          </h1>
          {intro ? <p className="pp-muted mt-4 max-w-3xl text-base leading-relaxed md:text-lg">{intro}</p> : null}

          {avatars.length > 0 || socialProofText ? (
            <div className="mt-5 flex items-center justify-center gap-3">
              {avatars.length > 0 ? (
                <span className="flex -space-x-2">
                  {avatars.map((avatar, i) =>
                    avatar.image?.url ? (
                      <SiteImage
                        key={i}
                        media={avatar.image}
                        sizes="40px"
                        className="h-9 w-9 rounded-full border-2 border-white object-cover"
                      />
                    ) : null,
                  )}
                </span>
              ) : null}
              {socialProofText ? <span className="pp-muted text-sm md:text-base">{socialProofText}</span> : null}
            </div>
          ) : null}

          {features.length > 0 ? (
            <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 md:mt-6">
              {features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm font-medium md:text-base">
                  <span style={{ color: "var(--pp-c-primary)" }}>
                    <Glyph svg={icons[i]} size={20} />
                  </span>
                  {feature.title}
                </li>
              ))}
            </ul>
          ) : null}

          {bannerDesktop?.url || bannerMobile?.url ? (
            <div className="mt-6 flex w-full justify-center md:mt-12">
              {bannerMobile?.url ? (
                <SiteImage
                  media={bannerMobile}
                  sizes="100vw"
                  priority
                  className={cn("h-auto w-full", bannerDesktop?.url && "md:hidden")}
                />
              ) : null}
              {bannerDesktop?.url ? (
                <SiteImage
                  media={bannerDesktop}
                  sizes="(max-width: 768px) 100vw, 960px"
                  priority
                  className={cn("h-auto w-full max-w-4xl", bannerMobile?.url && "hidden md:block")}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
};

export default LanderHeroView;
