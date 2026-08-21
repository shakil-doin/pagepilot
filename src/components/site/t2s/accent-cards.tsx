import { cn } from "@/lib/utils";
import type { CardItem } from "@/widgets/t2s-lib";

export type Accent = "danger" | "success" | "primary" | "warning";

const ACCENT: Record<Accent, string> = {
  danger: "var(--pp-danger, #dc2626)",
  success: "var(--pp-success, #16a34a)",
  primary: "var(--pp-c-primary)",
  warning: "var(--pp-warning, #d97706)",
};

type Props = {
  items: CardItem[];
  icons?: (string | null)[];
  accent: Accent;
  columns?: number;
  leftBar?: boolean;
  className?: string;
};

const COLUMNS: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

// Tinted problem/solution cards: a solid icon tile over a washed background in
// the same hue. trade2sync uses red for problems and green for solutions.
const AccentCards = ({ items, icons = [], accent, columns = 4, leftBar = false, className }: Props) => {
  if (items.length === 0) return null;
  const color = ACCENT[accent];

  return (
    <div className={cn("grid grid-cols-1 gap-4 md:gap-6", COLUMNS[columns] ?? COLUMNS[4], className)}>
      {items.map((item, i) => (
        <div
          key={i}
          className={cn("flex flex-col gap-6 rounded-[var(--pp-radius-lg)] border p-6", leftBar && "border-l-2")}
          style={{
            background: `color-mix(in srgb, ${color} 8%, transparent)`,
            borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
          }}
        >
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--pp-radius-md)] text-white [&>svg]:h-5 [&>svg]:w-5"
            style={{ background: color }}
            dangerouslySetInnerHTML={icons[i] ? { __html: icons[i]! } : undefined}
          />
          <div className="flex flex-col gap-2">
            <h3 className="pp-heading text-base font-semibold md:text-xl">{item.title}</h3>
            {item.description ? <p className="pp-muted leading-6">{item.description}</p> : null}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AccentCards;
