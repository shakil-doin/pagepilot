import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import RichHtml from "@/components/site/rich-html";
import SectionHead from "@/components/site/t2s/section-head";
import SiteButton from "@/components/site/site-button";
import type { Props } from "./schema";

const T2sAuthorsLegal = ({ title, rule, body, buttons, tone }: Props) => {
  const dark = isDarkTone(tone);

  return (
    <Panel tone={tone}>
      <div
        className="mx-auto max-w-4xl rounded-[var(--pp-radius-xl)] p-6 md:p-10 lg:p-14"
        style={{ background: dark ? "rgb(255 255 255 / 0.07)" : "var(--pp-c-surface)" }}
      >
        <SectionHead title={title} align="center" rule={rule} dark={dark} />
        {body ? (
          <div className="mt-6 text-sm md:text-base">
            <RichHtml html={body} />
          </div>
        ) : null}
      </div>
      {buttons.length > 0 ? (
        <div className="mt-8 flex justify-center gap-4">
          {buttons.map((button, i) => (
            <SiteButton key={i} button={button} size="lg" />
          ))}
        </div>
      ) : null}
    </Panel>
  );
};

export default T2sAuthorsLegal;
