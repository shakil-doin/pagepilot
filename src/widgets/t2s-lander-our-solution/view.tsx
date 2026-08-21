import Glyph from "@/components/site/t2s/glyph";
import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const LanderOurSolutionView = ({
  badge,
  title,
  description,
  stepper,
  steps,
  tone,
  rounded,
  icons = [],
}: Props & { icons?: (string | null)[] }) => {
  const dark = isDarkTone(tone);
  // Progress fill stops at the last completed node.
  const doneCount = stepper.filter((node) => node.done).length;

  return (
    <Panel tone={tone} rounded={rounded}>
      <div className="flex flex-col items-center gap-10 md:gap-16">
        <div className="flex w-full flex-col items-center gap-8 md:gap-10">
          <SectionHead badge={badge} title={title} description={description} align="center" dark={dark} />

          {stepper.length > 0 ? (
            <div className="hidden w-full max-w-3xl lg:block">
              <div className="relative flex items-start justify-between">
                <div
                  className="absolute top-[18px] h-1 -translate-y-1/2 rounded-full"
                  style={{
                    left: `${50 / stepper.length}%`,
                    right: `${50 / stepper.length}%`,
                    background: dark ? "rgb(255 255 255 / 0.15)" : "var(--pp-c-border)",
                  }}
                />
                <div
                  className="absolute top-[18px] h-1 -translate-y-1/2 rounded-full"
                  style={{
                    left: `${50 / stepper.length}%`,
                    width: `${Math.max(doneCount - 1, 0) * (100 / stepper.length)}%`,
                    background: "var(--pp-c-primary)",
                  }}
                />

                {stepper.map((node, i) => (
                  <div key={i} className="relative z-10 flex flex-1 flex-col items-center gap-2">
                    <span
                      className={cn("flex h-9 w-9 items-center justify-center rounded-full border")}
                      style={
                        node.done
                          ? { background: "var(--pp-c-primary)", borderColor: "var(--pp-c-primary)", color: "#fff" }
                          : {
                              background: dark ? "rgb(255 255 255 / 0.1)" : "var(--pp-c-background)",
                              borderColor: "var(--pp-c-primary)",
                            }
                      }
                    >
                      {node.done ? (
                        <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
                          <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <span className="text-sm font-medium">{i + 1}</span>
                      )}
                    </span>
                    <span className="text-center text-base font-medium">{node.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div
          className={cn(
            "grid w-full grid-cols-1 gap-12 sm:grid-cols-2",
            steps.length === 3 && "lg:grid-cols-3",
            steps.length >= 4 && "lg:grid-cols-4",
          )}
        >
          {steps.map((step, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center gap-6 text-center lg:gap-10">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white [&>svg]:h-6 [&>svg]:w-6"
                style={{ background: "var(--pp-c-primary)" }}
              >
                <Glyph svg={icons[i]} size={24} />
              </span>
              <div className="flex flex-col items-center gap-3">
                {step.step ? (
                  <span
                    className="inline-flex items-center rounded-full px-4 py-1 text-base"
                    style={{ background: dark ? "rgb(255 255 255 / 0.18)" : "var(--pp-c-surface)" }}
                  >
                    {step.step}
                  </span>
                ) : null}
                <h3 className="pp-heading text-xl font-semibold">{step.title}</h3>
                {step.text ? <p className="pp-muted max-w-sm text-base leading-7">{step.text}</p> : null}
                {step.check ? (
                  <p className="flex items-center gap-2 text-sm md:text-base">
                    <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
                      <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {step.check}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
};

export default LanderOurSolutionView;
