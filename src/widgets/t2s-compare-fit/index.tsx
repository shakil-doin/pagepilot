import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const T2sCompareFit = ({ badge, title, description, rows, tone }: Props) => {
  const dark = isDarkTone(tone);

  return (
    <Panel tone={tone}>
      <div className="flex flex-col items-center gap-12">
        <SectionHead badge={badge} title={title} description={description} align="center" dark={dark} />
        <div
          className="w-full max-w-4xl rounded-[var(--pp-radius-xl)] border p-6 sm:p-8"
          style={{
            background: dark ? "rgb(255 255 255 / 0.06)" : "var(--pp-c-surface)",
            borderColor: dark ? "rgb(255 255 255 / 0.14)" : "var(--pp-c-border)",
          }}
        >
          {rows.map((row, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center justify-between gap-3 py-4 sm:py-5",
                i < rows.length - 1 && "border-b border-dashed",
              )}
              style={{ borderColor: dark ? "rgb(255 255 255 / 0.2)" : "var(--pp-c-border)" }}
            >
              <span className="text-base sm:text-lg">{row.need}</span>
              <span
                className={cn("shrink-0 text-right text-sm sm:text-base", row.highlight && "font-semibold")}
                style={row.highlight ? { color: "var(--pp-c-primary)" } : undefined}
              >
                {row.pick}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
};

export default T2sCompareFit;
