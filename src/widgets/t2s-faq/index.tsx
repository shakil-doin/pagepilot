import Link from "next/link";
import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import type { Props } from "./schema";

// Native <details> keeps the accordion JS-free, matching the built-in FAQ widget.
const T2sFaq = ({
  badge,
  title,
  description,
  items,
  ctaTitle,
  ctaDescription,
  ctaLabel,
  ctaLink,
  emitJsonLd,
  tone,
}: Props) => {
  const dark = isDarkTone(tone);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <Panel tone={tone}>
      <div className="grid grid-cols-1 gap-8 md:gap-16 lg:grid-cols-2">
        <div>
          <SectionHead badge={badge} title={title} description={description} align="left" dark={dark} />
          {ctaTitle ? (
            <div
              className="mt-8 flex w-full max-w-md flex-col items-start gap-6 rounded-[var(--pp-radius-lg)] border p-5 md:p-8"
              style={{
                background: dark ? "rgb(255 255 255 / 0.06)" : "var(--pp-c-surface)",
                borderColor: dark ? "rgb(255 255 255 / 0.14)" : "var(--pp-c-border)",
              }}
            >
              <div>
                <h3 className="pp-heading text-xl font-medium md:text-2xl">{ctaTitle}</h3>
                {ctaDescription ? <p className="pp-muted mt-2 leading-relaxed">{ctaDescription}</p> : null}
              </div>
              {ctaLabel && ctaLink?.href ? (
                <Link
                  href={ctaLink.href}
                  target={ctaLink.newTab ? "_blank" : undefined}
                  rel={ctaLink.newTab ? "noopener noreferrer" : undefined}
                  className="pp-btn-primary inline-flex w-full items-center justify-center px-5 py-2.5 text-sm font-medium"
                >
                  {ctaLabel}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-4">
          {items.map((item, i) => (
            <details
              key={i}
              className="group rounded-[var(--pp-radius-lg)] border p-4 md:p-6"
              style={{
                background: dark ? "rgb(255 255 255 / 0.06)" : "var(--pp-c-surface)",
                borderColor: dark ? "rgb(255 255 255 / 0.14)" : "var(--pp-c-border)",
              }}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-medium md:text-lg [&::-webkit-details-marker]:hidden">
                {item.question}
                <span aria-hidden className="transition-transform group-open:rotate-45" style={{ color: "var(--pp-c-primary)" }}>
                  +
                </span>
              </summary>
              <p className="pp-muted mt-4 text-sm leading-relaxed md:text-base">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
      {emitJsonLd && items.length > 0 ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      ) : null}
    </Panel>
  );
};

export default T2sFaq;
