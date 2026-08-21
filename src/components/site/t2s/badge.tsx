import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  tone?: "light" | "dark";
  className?: string;
};

// The pill that opens most trade2sync sections. Border + tint come from the
// primary token, so it inherits the site theme.
const Badge = ({ children, tone = "light", className }: Props) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-4 py-1.5 text-xs font-medium md:text-sm",
      className,
    )}
    style={
      tone === "dark"
        ? { background: "rgb(255 255 255 / 0.14)", color: "#fff", border: "1px solid rgb(255 255 255 / 0.22)" }
        : {
            background: "color-mix(in srgb, var(--pp-c-primary) 10%, transparent)",
            color: "var(--pp-c-primary)",
            border: "1px solid color-mix(in srgb, var(--pp-c-primary) 24%, transparent)",
          }
    }
  >
    {children}
  </span>
);

type TagProps = {
  tag: string;
  children: React.ReactNode;
  tone?: "light" | "dark";
};

// Two-part pill: a solid brand chip plus trailing text.
export const TagBadge = ({ tag, children, tone = "light" }: TagProps) => (
  <span
    className={cn("inline-flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-xs md:text-sm")}
    style={
      tone === "dark"
        ? { background: "rgb(255 255 255 / 0.12)", color: "#fff" }
        : { background: "var(--pp-c-surface)", color: "var(--pp-c-textMuted)" }
    }
  >
    <span
      className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white md:text-xs"
      style={{ background: "var(--pp-c-primary)" }}
    >
      {tag}
    </span>
    {children}
  </span>
);

export default Badge;
