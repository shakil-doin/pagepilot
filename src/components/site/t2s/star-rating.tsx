import { cn } from "@/lib/utils";

const STAR = "M10 1l2.472 7.608H20l-6.236 4.528 2.472 7.608L10 16.216l-6.236 4.528 2.472-7.608L0 8.608h7.528z";

type Props = {
  rating: number;
  max?: number;
  className?: string;
};

// Boxed star row (trade2sync's Trustpilot-style rating). Filled boxes use the
// theme's success token; half stars clip the fill.
const StarRating = ({ rating, max = 5, className }: Props) => (
  <div role="img" aria-label={`${rating} out of ${max} stars`} className="flex items-center gap-1">
    {Array.from({ length: max }).map((_, i) => {
      const full = rating >= i + 1;
      const half = !full && rating >= i + 0.5;
      return (
        <span
          key={i}
          className={cn("relative flex items-center justify-center overflow-hidden rounded-[2px]", className ?? "h-5 w-5")}
          style={{ background: "rgb(148 163 184 / 0.45)" }}
        >
          <span
            className="absolute inset-0"
            style={{
              background: "var(--pp-success, #00b67a)",
              clipPath: half ? "inset(0 50% 0 0)" : undefined,
              display: full || half ? undefined : "none",
            }}
          />
          <svg viewBox="0 0 20 20" aria-hidden className="relative h-3 w-3">
            <path d={STAR} fill="#fff" />
          </svg>
        </span>
      );
    })}
  </div>
);

export default StarRating;
