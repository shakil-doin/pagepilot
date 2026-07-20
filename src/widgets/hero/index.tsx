import Container from "@/components/site/container";
import SiteButton from "@/components/site/site-button";
import SiteImage from "@/components/site/site-image";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const Hero = ({ eyebrow, headline, subtext, buttons, image, layout, background }: Props) => {
  const dark = background === "gradient" || background === "secondary";

  return (
    <section
      className={cn("py-16 md:py-24", dark && "pp-on-dark", background === "surface" && "pp-bg-surface")}
      style={{
        background:
          background === "gradient"
            ? "var(--pp-gradient-brand)"
            : background === "secondary"
              ? "var(--pp-c-secondary)"
              : undefined,
      }}
    >
      <Container>
        <div
          className={cn(
            layout === "split"
              ? "grid items-center gap-12 md:grid-cols-2"
              : "mx-auto max-w-3xl text-center",
          )}
        >
          <div>
            {eyebrow ? (
              <p className="pp-eyebrow mb-3 text-sm font-semibold uppercase tracking-wider">{eyebrow}</p>
            ) : null}
            <h1 className="pp-heading leading-tight" style={{ fontSize: "var(--pp-text-h1)" }}>
              {headline}
            </h1>
            {subtext ? <p className="pp-muted mt-5 text-lg leading-relaxed">{subtext}</p> : null}
            {buttons.length > 0 ? (
              <div className={cn("mt-8 flex flex-wrap gap-3", layout === "center" && "justify-center")}>
                {buttons.map((button, i) => (
                  <SiteButton key={i} button={button} size="lg" />
                ))}
              </div>
            ) : null}
          </div>
          {image?.url ? (
            <div className={cn(layout === "center" && "mt-12")}>
              <SiteImage
                media={image}
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="h-auto w-full rounded-[var(--pp-radius-xl)]"
              />
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
};

export default Hero;
