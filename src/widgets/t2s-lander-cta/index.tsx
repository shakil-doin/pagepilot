import Badge from "@/components/site/t2s/badge";
import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SiteButton from "@/components/site/site-button";
import type { Props } from "./schema";

const T2sLanderCta = ({ badge, title, description, buttons, tone, rounded }: Props) => {
  const dark = isDarkTone(tone);

  return (
    <Panel tone={tone} rounded={rounded}>
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center md:gap-6">
        {badge ? <Badge tone={dark ? "dark" : "light"}>{badge}</Badge> : null}
        <h2 className="pp-heading leading-tight" style={{ fontSize: "var(--pp-text-h2)" }}>
          {title}
        </h2>
        {description ? <p className="pp-muted text-sm md:text-base">{description}</p> : null}
        {buttons.length > 0 ? (
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {buttons.map((button, i) => (
              <SiteButton key={i} button={button} size="lg" />
            ))}
          </div>
        ) : null}
      </div>
    </Panel>
  );
};

export default T2sLanderCta;
