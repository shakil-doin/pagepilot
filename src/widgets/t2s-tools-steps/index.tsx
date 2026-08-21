import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const T2sToolsSteps = ({ badge, title, description, columns, steps, noteLabel, note, tone }: Props) => {
  const dark = isDarkTone(tone);

  return (
    <Panel tone={tone}>
      <SectionHead badge={badge} title={title} description={description} align="center" dark={dark} />

      <div
        className={cn("mx-auto mt-10 grid max-w-4xl gap-5", {
          "md:grid-cols-2": columns === 2,
          "md:grid-cols-3": columns === 3,
          "md:grid-cols-2 lg:grid-cols-4": columns === 4,
        })}
      >
        {steps.map((step, i) => (
          <div
            key={i}
            className="rounded-[var(--pp-radius-xl)] border p-6 transition-transform hover:-translate-y-0.5"
            style={{
              background: dark ? "rgb(255 255 255 / 0.07)" : "var(--pp-c-background)",
              borderColor: dark ? "rgb(255 255 255 / 0.14)" : "var(--pp-c-border)",
            }}
          >
            <span
              className="mb-3.5 grid h-9 w-9 place-items-center rounded-[var(--pp-radius-md)] font-extrabold text-white"
              style={{ background: "var(--pp-c-primary)" }}
            >
              {i + 1}
            </span>
            <h3 className="pp-heading mb-1.5 text-base font-bold">{step.title}</h3>
            {step.description ? <p className="pp-muted text-sm">{step.description}</p> : null}
          </div>
        ))}
      </div>

      {note ? (
        <p
          className="pp-muted mx-auto mt-9 max-w-3xl rounded-[var(--pp-radius-md)] border border-l-4 px-5 py-4 text-sm"
          style={{
            borderColor: "var(--pp-c-border)",
            borderLeftColor: "var(--pp-c-primary)",
            background: dark ? "rgb(255 255 255 / 0.07)" : "var(--pp-c-surface)",
          }}
        >
          <strong className="pp-heading font-bold">{noteLabel}</strong> {note}
        </p>
      ) : null}
    </Panel>
  );
};

export default T2sToolsSteps;
