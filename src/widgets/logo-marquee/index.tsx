import Container from "@/components/site/container";
import SiteImage from "@/components/site/site-image";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const DURATIONS = { slow: "60s", normal: "40s", fast: "20s" } as const;

const LogoMarquee = ({ title, logos, speed, grayscale }: Props) => {
  if (logos.length === 0) return null;

  return (
    <section className="py-14 md:py-20">
      {title ? (
        <Container>
          <p className="pp-muted mb-8 text-center text-sm font-semibold uppercase tracking-wider">{title}</p>
        </Container>
      ) : null}
      <style>{`
        .pp-marquee-track{animation:pp-marquee linear infinite}
        @keyframes pp-marquee{to{transform:translateX(-50%)}}
        @media (prefers-reduced-motion:reduce){.pp-marquee-track{animation-play-state:paused}}
      `}</style>
      <div className="overflow-hidden">
        <div className="pp-marquee-track flex w-max" style={{ animationDuration: DURATIONS[speed] }}>
          {/* Row is rendered twice; translateX(-50%) lands exactly on the copy, so the loop is seamless. */}
          {[0, 1].map((copy) => (
            <div key={copy} aria-hidden={copy === 1 || undefined} className="flex items-center gap-12 pr-12">
              {logos.map((logo, i) => (
                <SiteImage
                  key={i}
                  media={logo.image}
                  sizes="200px"
                  className={cn("h-10 w-auto shrink-0 object-contain", grayscale && "opacity-70 grayscale")}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogoMarquee;
