import Container from "@/components/site/container";
import { cn } from "@/lib/utils";

export type Tone = "light" | "surface" | "dark" | "brand";
export type Padding = "none" | "sm" | "md" | "lg";

const PADDING: Record<Padding, string> = {
  none: "",
  sm: "py-8 md:py-10",
  md: "py-10 md:py-16",
  lg: "py-14 md:py-24",
};

// Tone maps the trade2sync navy/brand panels onto PagePilot theme tokens, so a
// ported section repaints with the active theme instead of hardcoding blue.
export const toneStyle = (tone: Tone): React.CSSProperties =>
  tone === "dark"
    ? { background: "var(--pp-c-secondary)" }
    : tone === "brand"
      ? { background: "var(--pp-gradient-brand)" }
      : {};

export const isDarkTone = (tone: Tone) => tone === "dark" || tone === "brand";

type Props = {
  tone?: Tone;
  padding?: Padding;
  rounded?: boolean;
  contained?: boolean;
  className?: string;
  id?: string;
  children: React.ReactNode;
};

// Full-bleed section wrapper. `rounded` reproduces the t2s inset panel look
// (a rounded dark slab sitting inside the page gutter).
const Panel = ({
  tone = "light",
  padding = "lg",
  rounded = false,
  contained = true,
  className,
  id,
  children,
}: Props) => {
  const dark = isDarkTone(tone);
  const body = (
    <div
      className={cn(
        PADDING[padding],
        tone === "surface" && "pp-bg-surface",
        dark && "pp-on-dark",
        rounded && "overflow-hidden rounded-[var(--pp-radius-xl)]",
        className,
      )}
      style={toneStyle(tone)}
    >
      {contained ? <Container>{children}</Container> : children}
    </div>
  );

  // A rounded panel needs the gutter applied outside the slab, otherwise the
  // rounded corners run to the viewport edge.
  return (
    <section id={id}>{rounded ? <Container>{body}</Container> : body}</section>
  );
};

export default Panel;
