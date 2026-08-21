import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import SiteButton from "@/components/site/site-button";
import type { Props } from "./schema";

const T2sLearnFits = ({ badge, title, description, steps, buttons, tone, rounded }: Props) => {
  const dark = isDarkTone(tone);

  return (
    <Panel tone={tone} rounded={rounded}>
      <div className="flex flex-col items-center gap-8 text-center md:gap-12">
        <div className="flex flex-col items-center gap-6">
          <SectionHead badge={badge} title={title} description={description} align="center" dark={dark} />
          {steps.length > 0 ? (
            <ul className="flex flex-wrap items-start justify-center gap-3 md:gap-4">
              {steps.map((step, i) => (
                <li
                  key={i}
                  className="inline-flex items-center rounded-full px-5 py-2.5 text-base font-medium md:px-6 md:py-3 md:text-lg"
                  style={{ background: dark ? "rgb(255 255 255 / 0.18)" : "var(--pp-c-surface)" }}
                >
                  {step.text}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {buttons.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-3">
            {buttons.map((button, i) => (
              <SiteButton key={i} button={button} size="lg" />
            ))}
          </div>
        ) : null}
      </div>
    </Panel>
  );
};

export default T2sLearnFits;
