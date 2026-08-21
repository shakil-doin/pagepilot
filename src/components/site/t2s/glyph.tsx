import { cn } from "@/lib/utils";

type Props = {
  svg?: string | null;
  size?: number;
  className?: string;
  tone?: "solid" | "soft" | "plain";
};

// Renders an icon SVG that was already resolved server-side (see resolveIcons).
// Keeping resolution out of this component lets the builder canvas render the
// same markup on the client, where the icon database is not reachable.
const Glyph = ({ svg, size = 24, className, tone = "plain" }: Props) => {
  if (tone === "plain") {
    if (!svg) return null;
    return (
      <span
        className={cn("inline-flex shrink-0 [&>svg]:block", className)}
        style={{ width: size, height: size }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  }

  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-[var(--pp-radius-md)] [&>svg]:block", className)}
      style={{
        width: size * 2,
        height: size * 2,
        background:
          tone === "solid"
            ? "var(--pp-c-primary)"
            : "color-mix(in srgb, var(--pp-c-primary) 12%, transparent)",
        color: tone === "solid" ? "#fff" : "var(--pp-c-primary)",
      }}
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    />
  );
};

export default Glyph;
