"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

type Item = Props["items"][number];

const Star = ({ filled }: { filled: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden
  >
    <path d="M12 2l2.9 6.26 6.6.56-5 4.36 1.5 6.45L12 16.2l-6 3.43 1.5-6.45-5-4.36 6.6-.56L12 2z" />
  </svg>
);

const Chevron = ({ direction }: { direction: "left" | "right" }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    {direction === "left" ? <path d="M15 6l-6 6 6 6" /> : <path d="M9 6l6 6-6 6" />}
  </svg>
);

const TestimonialSliderClient = ({ items }: { items: Item[] }) => {
  const [index, setIndex] = useState(0);
  const count = items.length;

  const prev = () => setIndex((i) => (i - 1 + count) % count);
  const next = () => setIndex((i) => (i + 1) % count);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {items.map((item, i) => (
            <figure key={i} className="w-full shrink-0 px-2 text-center" aria-hidden={i !== index || undefined}>
              {item.avatar?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.avatar.url}
                  alt={item.avatar.alt ?? item.name}
                  className="mx-auto mb-4 h-14 w-14 rounded-full object-cover"
                  loading="lazy"
                />
              ) : null}
              {item.rating ? (
                <div
                  className="mb-3 flex justify-center gap-1"
                  style={{ color: "var(--pp-c-primary)" }}
                  aria-label={`Rated ${item.rating} out of 5`}
                >
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} filled={s < item.rating!} />
                  ))}
                </div>
              ) : null}
              <blockquote className="text-lg leading-relaxed md:text-xl">{item.quote}</blockquote>
              <figcaption className="mt-4">
                <span className="font-semibold">{item.name}</span>
                {item.role ? <span className="pp-muted"> · {item.role}</span> : null}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      {count > 1 ? (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous testimonial"
            className="flex h-10 w-10 items-center justify-center rounded-full border transition-opacity hover:opacity-70"
            style={{ borderColor: "var(--pp-c-border)" }}
          >
            <Chevron direction="left" />
          </button>
          <div className="flex gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                className={cn("h-2.5 w-2.5 rounded-full transition-opacity", i !== index && "opacity-30")}
                style={{ background: "var(--pp-c-primary)" }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={next}
            aria-label="Next testimonial"
            className="flex h-10 w-10 items-center justify-center rounded-full border transition-opacity hover:opacity-70"
            style={{ borderColor: "var(--pp-c-border)" }}
          >
            <Chevron direction="right" />
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default TestimonialSliderClient;
