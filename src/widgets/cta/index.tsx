import Container from "@/components/site/container";
import SiteButton from "@/components/site/site-button";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const Cta = ({ headline, subtext, buttons, style }: Props) => (
  <section className="py-14 md:py-20">
    <Container>
      <div
        className={cn(
          "rounded-[var(--pp-radius-xl)] px-8 py-14 text-center md:px-16",
          style !== "surface" && "pp-on-dark",
          style === "surface" && "pp-bg-surface",
        )}
        style={{
          background:
            style === "gradient"
              ? "var(--pp-gradient-brand)"
              : style === "secondary"
                ? "var(--pp-c-secondary)"
                : undefined,
        }}
      >
        <h2 className="pp-heading" style={{ fontSize: "var(--pp-text-h2)" }}>
          {headline}
        </h2>
        {subtext ? <p className="pp-muted mx-auto mt-4 max-w-xl text-lg">{subtext}</p> : null}
        {buttons.length > 0 ? (
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {buttons.map((button, i) => (
              <SiteButton key={i} button={button} size="lg" />
            ))}
          </div>
        ) : null}
      </div>
    </Container>
  </section>
);

export default Cta;
