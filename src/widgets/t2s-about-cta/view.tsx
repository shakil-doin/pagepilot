import Badge from "@/components/site/t2s/badge";
import Glyph from "@/components/site/t2s/glyph";
import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SiteButton from "@/components/site/site-button";
import type { Props } from "./schema";

const AboutCtaView = ({ badge, title, description, buttons, tone, iconSvg }: Props & { iconSvg?: string | null }) => {
  const dark = isDarkTone(tone);

  return (
    <Panel tone={tone}>
      <div className="flex flex-col items-center text-center">
        {badge ? (
          <Badge tone={dark ? "dark" : "light"} className="gap-2">
            <Glyph svg={iconSvg} size={16} />
            {badge}
          </Badge>
        ) : null}
        <h2 className="pp-heading mt-6 max-w-2xl leading-tight" style={{ fontSize: "var(--pp-text-h2)" }}>
          {title}
        </h2>
        {description ? <p className="pp-muted mt-5 max-w-2xl leading-relaxed">{description}</p> : null}
        {buttons.length > 0 ? (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {buttons.map((button, i) => (
              <SiteButton key={i} button={button} size="lg" />
            ))}
          </div>
        ) : null}
      </div>
    </Panel>
  );
};

export default AboutCtaView;
