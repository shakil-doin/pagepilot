import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import { cn } from "@/lib/utils";
import type { Props, TableCell } from "./schema";

const Cell = ({ cell, emphasized }: { cell: TableCell; emphasized: boolean }) => {
  const text = cell.text ? (
    <span className={cn("pp-muted", emphasized && "pp-heading font-medium")}>{cell.text}</span>
  ) : null;

  if (cell.kind === "rating") {
    return (
      <span className="flex items-center gap-1.5">
        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="#facc15" aria-hidden>
          <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
        </svg>
        {text}
      </span>
    );
  }

  if (cell.kind === "text") return text;

  const good = cell.kind === "check";
  return (
    <span className="flex items-center gap-2">
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6 shrink-0"
        fill={good ? "var(--pp-success, #16a34a)" : "var(--pp-danger, #dc2626)"}
        aria-label={good ? "Yes" : "No"}
      >
        {good ? (
          <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1 14l-4-4 1.4-1.4L11 13.2l4.6-4.6L17 10l-6 6z" />
        ) : (
          <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm4 12.6L14.6 16 12 13.4 9.4 16 8 14.6 10.6 12 8 9.4 9.4 8 12 10.6 14.6 8 16 9.4 13.4 12 16 14.6z" />
        )}
      </svg>
      {text}
    </span>
  );
};

const T2sCompareFeatureTable = ({ badge, title, description, featureLabel, columns, rows, tone }: Props) => {
  const dark = isDarkTone(tone);
  const grid = `repeat(${columns.length + 1}, minmax(0,1fr))`;
  const border = dark ? "rgb(255 255 255 / 0.14)" : "var(--pp-c-border)";
  const surface = dark ? "rgb(255 255 255 / 0.07)" : "var(--pp-c-surface)";

  return (
    <Panel tone={tone}>
      <div className="flex flex-col items-center gap-12 md:gap-16">
        <SectionHead badge={badge} title={title} description={description} align="center" dark={dark} />

        <div className="w-full overflow-x-auto">
          <div style={{ minWidth: `${(columns.length + 1) * 180}px` }}>
            <div className="grid items-end border-b pb-6" style={{ gridTemplateColumns: grid, borderColor: border }}>
              <div className="px-1">
                <div
                  className="flex h-full items-start rounded-[var(--pp-radius-lg)] px-5 py-5 font-medium"
                  style={{ background: surface }}
                >
                  {featureLabel}
                </div>
              </div>
              {columns.map((column, i) => (
                <div key={i} className="px-1">
                  {column.highlight ? (
                    <div className="rounded-[var(--pp-radius-lg)] p-1 pt-1.5" style={{ background: "var(--pp-c-primary)" }}>
                      {column.badge ? (
                        <p className="pb-1.5 text-center text-sm font-medium text-white">{column.badge}</p>
                      ) : null}
                      <div
                        className="rounded-[var(--pp-radius-md)] p-3"
                        style={{ background: dark ? "var(--pp-c-secondary)" : "var(--pp-c-background)" }}
                      >
                        <h3 className="pp-heading text-xl font-medium">{column.name}</h3>
                        {column.tagline ? <p className="pp-muted mt-1 text-sm">{column.tagline}</p> : null}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[var(--pp-radius-lg)] border p-4" style={{ borderColor: border }}>
                      <h3 className="pp-heading text-lg font-medium">{column.name}</h3>
                      {column.tagline ? <p className="pp-muted mt-1 text-sm">{column.tagline}</p> : null}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {rows.map((row, i) => (
              <div
                key={i}
                className="grid border-b"
                style={{
                  gridTemplateColumns: grid,
                  borderColor: border,
                  background: i % 2 === 1 ? surface : undefined,
                }}
              >
                <div className="flex items-center px-5 py-3">{row.feature}</div>
                {row.cells.map((cell, ci) => (
                  <div key={ci} className="flex items-center px-5 py-3">
                    <Cell cell={cell} emphasized={ci === 0} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
};

export default T2sCompareFeatureTable;
