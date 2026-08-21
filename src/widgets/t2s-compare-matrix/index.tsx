import Link from "next/link";
import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import { cn } from "@/lib/utils";
import type { Cell, Props } from "./schema";

const MatrixCell = ({ cell }: { cell: Cell }) => {
  if (cell.kind === "check") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="var(--pp-success, #16a34a)" aria-label="Yes">
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1 14l-4-4 1.4-1.4L11 13.2l4.6-4.6L17 10l-6 6z" />
      </svg>
    );
  }
  if (cell.kind === "cross") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="var(--pp-danger, #dc2626)" aria-label="No">
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm4 12.6L14.6 16 12 13.4 9.4 16 8 14.6 10.6 12 8 9.4 9.4 8 12 10.6 14.6 8 16 9.4 13.4 12 16 14.6z" />
      </svg>
    );
  }
  return <span className="pp-muted whitespace-nowrap text-base">{cell.text}</span>;
};

const T2sCompareMatrix = ({ badge, title, description, productLabel, actionLabel, columns, rows, tone }: Props) => {
  const dark = isDarkTone(tone);
  // First column + feature columns + the action column.
  const grid = `minmax(150px,1.3fr) repeat(${columns.length}, minmax(96px,0.85fr)) minmax(120px,1fr)`;
  const border = dark ? "rgb(255 255 255 / 0.14)" : "var(--pp-c-border)";

  return (
    <Panel tone={tone}>
      <div className="flex flex-col items-center gap-8 md:gap-14">
        <SectionHead badge={badge} title={title} description={description} align="center" dark={dark} />

        <div className="w-full overflow-x-auto">
          <div style={{ minWidth: `${(columns.length + 2) * 140}px` }}>
            <div className="grid items-center gap-2 pb-3 pt-4" style={{ gridTemplateColumns: grid }}>
              <div
                className="rounded-[var(--pp-radius-lg)] px-5 py-3 text-base font-medium"
                style={{ background: dark ? "rgb(255 255 255 / 0.08)" : "var(--pp-c-surface)" }}
              >
                {productLabel}
              </div>
              {columns.map((column, i) => (
                <div
                  key={i}
                  className="rounded-[var(--pp-radius-lg)] border px-4 py-3 text-base font-medium"
                  style={{ borderColor: border }}
                >
                  {column.label}
                </div>
              ))}
              <div
                className="rounded-[var(--pp-radius-lg)] border px-4 py-3 text-base font-medium"
                style={{ borderColor: border }}
              >
                {actionLabel}
              </div>
            </div>

            {rows.map((row, i) => (
              <div
                key={i}
                className="grid items-center gap-2 border-b"
                style={{
                  gridTemplateColumns: grid,
                  borderColor: border,
                  background: i % 2 === 1 ? (dark ? "rgb(255 255 255 / 0.05)" : "var(--pp-c-surface)") : undefined,
                }}
              >
                <div className={cn("whitespace-nowrap px-5 py-3 text-base", row.highlight && "pp-heading font-bold")}>
                  {row.product}
                </div>
                {row.cells.map((cell, ci) => (
                  <div key={ci} className="flex items-center px-4 py-3">
                    <MatrixCell cell={cell} />
                  </div>
                ))}
                <Link
                  href={row.link.href}
                  target={row.link.newTab ? "_blank" : undefined}
                  rel={row.link.newTab ? "noopener noreferrer" : undefined}
                  className="px-4 py-3 text-base font-medium"
                  style={{ color: "var(--pp-c-primary)" }}
                >
                  {row.actionLabel} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
};

export default T2sCompareMatrix;
