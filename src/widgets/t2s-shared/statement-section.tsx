import Panel, { isDarkTone, type Tone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import RichHtml from "@/components/site/rich-html";

export type StatementSectionProps = {
  badge?: string;
  title?: string;
  body: string;
  align: "center" | "left";
  tone: Tone;
};

// Centered statement block (About mission / vision). The body is rich text so an
// editor can bold a phrase the way the original hardcoded runs did.
const StatementSection = ({ badge, title, body, align, tone }: StatementSectionProps) => (
  <Panel tone={tone}>
    <SectionHead badge={badge} title={title} align={align} dark={isDarkTone(tone)} />
    {body ? (
      <div className={align === "center" ? "mx-auto mt-6 max-w-3xl text-center" : "mt-6 max-w-3xl"}>
        <RichHtml html={body} />
      </div>
    ) : null}
  </Panel>
);

export default StatementSection;
