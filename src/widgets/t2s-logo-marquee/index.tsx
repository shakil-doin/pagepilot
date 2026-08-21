import Container from "@/components/site/container";
import Marquee from "@/components/site/t2s/marquee";
import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import SiteImage from "@/components/site/site-image";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const T2sLogoMarquee = ({ badge, title, description, align, logos, speed, grayscale, tone }: Props) => (
  <Panel tone={tone} contained={false}>
    <Container>
      <SectionHead badge={badge} title={title} description={description} align={align} dark={isDarkTone(tone)} />
    </Container>
    <div
      className="mt-8 md:mt-10"
      style={{
        maskImage: "linear-gradient(to right,transparent,#000 8%,#000 92%,transparent)",
        WebkitMaskImage: "linear-gradient(to right,transparent,#000 8%,#000 92%,transparent)",
      }}
    >
      <Marquee speed={speed} itemClassName="w-36 md:w-56">
        {logos.map((logo, i) => (
          <div key={i} className="flex h-14 items-center justify-center md:h-24">
            {logo.logo?.url ? (
              <SiteImage
                media={logo.logo}
                sizes="220px"
                className={cn("h-full w-auto max-w-full object-contain", grayscale && "opacity-70 grayscale")}
              />
            ) : (
              <span className="pp-muted text-sm">{logo.name}</span>
            )}
          </div>
        ))}
      </Marquee>
    </div>
  </Panel>
);

export default T2sLogoMarquee;
