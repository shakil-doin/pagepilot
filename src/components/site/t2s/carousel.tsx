"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode[];
  // Tailwind basis classes per breakpoint, e.g. "basis-[85%] sm:basis-1/2 lg:basis-1/3"
  itemClassName?: string;
  dark?: boolean;
  arrows?: boolean;
};

// Scroll-snap carousel with arrow controls. Replaces embla in the ported t2s
// sections: no extra dependency, same behaviour for a row of cards.
const Carousel = ({ children, itemClassName = "basis-[85%] sm:basis-1/2 lg:basis-1/3", dark = false, arrows = true }: Props) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    sync();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  const nudge = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div>
      <div
        ref={trackRef}
        className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children.map((child, i) => (
          <div key={i} className={cn("shrink-0 snap-start", itemClassName)}>
            {child}
          </div>
        ))}
      </div>
      {arrows && children.length > 1 ? (
        <div className="mt-6 flex justify-center gap-4">
          {([-1, 1] as const).map((direction) => (
            <button
              key={direction}
              type="button"
              aria-label={direction === -1 ? "Previous" : "Next"}
              onClick={() => nudge(direction)}
              disabled={direction === -1 ? atStart : atEnd}
              className="flex h-11 w-11 items-center justify-center rounded-full transition-opacity disabled:opacity-35"
              style={{ background: dark ? "rgb(255 255 255 / 0.15)" : "var(--pp-c-primary)", color: "#fff" }}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path
                  d={direction === -1 ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default Carousel;
