import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import SiteImage from "@/components/site/site-image";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const T2sHowWork = ({ badge, title, description, align, steps, tone, rounded }: Props) => {
  const dark = isDarkTone(tone);

  return (
    <Panel tone={tone} rounded={rounded}>
      <SectionHead badge={badge} title={title} description={description} align={align} dark={dark} />

      {steps.length > 0 ? (
        <ol className="mt-10 grid gap-3" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
          {steps.map((step, i) => (
            <li key={i} className="flex flex-col items-center gap-2 text-center">
              <span className="relative flex w-full items-center justify-center">
                {i > 0 ? (
                  <span
                    className="absolute right-1/2 top-1/2 h-1 w-full -translate-y-1/2 rounded-full"
                    style={{ background: dark ? "rgb(255 255 255 / 0.2)" : "var(--pp-c-border)" }}
                  />
                ) : null}
                <span
                  className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium"
                  style={{ borderColor: "var(--pp-c-primary)", background: "var(--pp-c-primary)", color: "#fff" }}
                >
                  {i + 1}
                </span>
              </span>
              <span className="hidden text-[13px] font-medium leading-tight md:block">{step.label}</span>
            </li>
          ))}
        </ol>
      ) : null}

      <div className="mt-10 flex flex-col gap-6 md:mt-14">
        {steps.map((step, i) => (
          <article
            key={i}
            className={cn(
              "grid items-center gap-6 rounded-[var(--pp-radius-xl)] border p-6 md:grid-cols-2 md:gap-10 md:p-10",
            )}
            style={{
              background: dark ? "rgb(255 255 255 / 0.07)" : "var(--pp-c-surface)",
              borderColor: dark ? "rgb(255 255 255 / 0.14)" : "var(--pp-c-border)",
            }}
          >
            <div>
              {step.pill ? (
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs md:px-4 md:py-1.5 md:text-sm"
                  style={{
                    background: dark ? "rgb(255 255 255 / 0.12)" : "var(--pp-c-background)",
                    color: dark ? "#fff" : "var(--pp-c-textMuted)",
                  }}
                >
                  {step.pill}
                </span>
              ) : null}
              <h3 className="pp-heading mt-3 text-xl font-semibold leading-snug md:text-3xl">{step.title}</h3>
              {step.description ? (
                <p className="pp-muted mt-2 text-sm leading-relaxed md:text-base">{step.description}</p>
              ) : null}
            </div>
            {step.image?.url ? (
              <SiteImage
                media={step.image}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="h-auto w-full rounded-[var(--pp-radius-lg)]"
              />
            ) : null}
          </article>
        ))}
      </div>
    </Panel>
  );
};

export default T2sHowWork;
