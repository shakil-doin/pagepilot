import { cn } from "@/lib/utils";
import type { StatItem } from "@/widgets/t2s-lib";

type Props = {
  stat: StatItem;
  dark?: boolean;
  size?: "sm" | "lg";
  className?: string;
};

// Big-number stat tile from the t2s About / Support sections.
const StatCard = ({ stat, dark = false, size = "lg", className }: Props) => (
  <div
    className={cn("flex flex-col rounded-[var(--pp-radius-lg)] border p-5 md:p-6", className)}
    style={
      dark
        ? { background: "rgb(255 255 255 / 0.08)", borderColor: "rgb(255 255 255 / 0.14)" }
        : { background: "var(--pp-c-surface)", borderColor: "var(--pp-c-border)" }
    }
  >
    <span
      className={cn("font-semibold leading-none", size === "lg" ? "text-3xl md:text-5xl" : "text-2xl md:text-3xl")}
      style={{ color: dark ? "#fff" : "var(--pp-c-primary)" }}
    >
      {stat.value}
    </span>
    <p className={cn("pp-heading mt-4 font-medium", size === "lg" ? "text-lg md:text-xl" : "text-sm md:text-base")}>
      {stat.label}
    </p>
    {stat.description ? <p className="pp-muted mt-1 text-sm leading-relaxed md:text-base">{stat.description}</p> : null}
  </div>
);

export default StatCard;
