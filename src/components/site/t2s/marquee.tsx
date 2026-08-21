import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode[];
  direction?: "left" | "right";
  speed?: "slow" | "normal" | "fast";
  itemClassName?: string;
  className?: string;
};

const DURATION = { slow: "80s", normal: "55s", fast: "30s" } as const;

// CSS-only infinite marquee row. The children are rendered twice and the track
// translates exactly half its width, so the loop is seamless.
const Marquee = ({ children, direction = "left", speed = "normal", itemClassName, className }: Props) => {
  if (children.length === 0) return null;
  return (
    <div className={cn("overflow-hidden", className)}>
      <style>{`
        .pp-t2s-marquee{animation:pp-t2s-marquee linear infinite}
        .pp-t2s-marquee-rev{animation-direction:reverse}
        @keyframes pp-t2s-marquee{to{transform:translateX(-50%)}}
        @media (prefers-reduced-motion:reduce){.pp-t2s-marquee{animation-play-state:paused}}
      `}</style>
      <div
        className={cn("pp-t2s-marquee flex w-max gap-4", direction === "right" && "pp-t2s-marquee-rev")}
        style={{ animationDuration: DURATION[speed] }}
      >
        {[0, 1].map((copy) => (
          <div key={copy} aria-hidden={copy === 1 || undefined} className="flex shrink-0 gap-4">
            {children.map((child, i) => (
              <div key={i} className={cn("shrink-0", itemClassName ?? "w-[320px] md:w-[380px]")}>
                {child}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
