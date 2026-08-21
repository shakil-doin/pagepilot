import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import type { Props } from "./schema";

const T2sChecklist = ({ badge, title, description, align, items, tone }: Props) => {
  const dark = isDarkTone(tone);

  return (
    <Panel tone={tone}>
      <div className="grid gap-10 xl:grid-cols-2 xl:gap-24">
        <SectionHead badge={badge} title={title} description={description} align={align} dark={dark} />
        <ul className="flex flex-col justify-center gap-4">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-[var(--pp-radius-lg)] px-5 py-4 md:px-6 md:py-5"
              style={{ background: dark ? "rgb(255 255 255 / 0.07)" : "var(--pp-c-surface)" }}
            >
              <span
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white"
                style={{ background: "var(--pp-c-primary)" }}
                aria-hidden
              >
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="pp-muted text-base md:text-lg">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
};

export default T2sChecklist;
