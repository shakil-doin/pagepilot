import { cn } from "@/lib/utils";

type Props = {
  items: { text: string }[];
  align?: "center" | "left";
  columns?: boolean;
  className?: string;
};

// Inline checkmark list used under t2s heroes and tour sections.
const CheckList = ({ items, align = "center", columns = false, className }: Props) => {
  if (items.length === 0) return null;
  return (
    <ul
      className={cn(
        "flex flex-wrap gap-x-6 gap-y-2",
        columns ? "flex-col" : "items-center",
        align === "center" && !columns && "justify-center",
        className,
      )}
    >
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-2 text-sm md:text-base">
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
            style={{ background: "color-mix(in srgb, var(--pp-c-primary) 15%, transparent)", color: "var(--pp-c-primary)" }}
            aria-hidden
          >
            <svg viewBox="0 0 20 20" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span>{item.text}</span>
        </li>
      ))}
    </ul>
  );
};

export default CheckList;
