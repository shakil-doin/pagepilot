import Glyph from "@/components/site/t2s/glyph";
import { cn } from "@/lib/utils";
import type { CardItem } from "@/widgets/t2s-lib";

export type IconStyle = "plain" | "soft" | "solid" | "circle";

type Props = {
  items: CardItem[];
  icons?: (string | null)[];
  columns?: number;
  align?: "center" | "left";
  iconStyle?: IconStyle;
  dark?: boolean;
  className?: string;
};

const COLUMNS: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

// The icon-card grid trade2sync reuses across About, Authors, Markets and
// Compare. Icon treatment and column count are the only things that vary.
const IconCards = ({
  items,
  icons = [],
  columns = 3,
  align = "center",
  iconStyle = "soft",
  dark = false,
  className,
}: Props) => {
  if (items.length === 0) return null;

  return (
    <div className={cn("grid gap-5", COLUMNS[columns] ?? COLUMNS[3], className)}>
      {items.map((item, i) => (
        <div
          key={i}
          className={cn(
            "flex flex-col rounded-[var(--pp-radius-lg)] border p-6 md:p-7",
            align === "center" && "items-center text-center",
          )}
          style={{
            background: dark ? "rgb(255 255 255 / 0.07)" : "var(--pp-c-background)",
            borderColor: dark ? "rgb(255 255 255 / 0.14)" : "var(--pp-c-border)",
          }}
        >
          {icons[i] ? (
            iconStyle === "circle" ? (
              <span
                className="flex h-14 w-14 items-center justify-center rounded-full text-white [&>svg]:h-6 [&>svg]:w-6"
                style={{ background: "var(--pp-gradient-brand, var(--pp-c-primary))" }}
                dangerouslySetInnerHTML={{ __html: icons[i]! }}
              />
            ) : (
              <Glyph
                svg={icons[i]}
                size={iconStyle === "plain" ? 40 : 16}
                tone={iconStyle === "plain" ? "plain" : iconStyle}
                className={iconStyle === "plain" ? "text-[color:var(--pp-c-primary)]" : undefined}
              />
            )
          ) : null}
          <h3 className="pp-heading mt-4 text-lg font-bold">{item.title}</h3>
          {item.description ? (
            <p className="pp-muted mt-2 text-sm leading-relaxed md:text-base">{item.description}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default IconCards;
