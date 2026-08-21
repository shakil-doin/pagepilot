import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import type { Props } from "./schema";

const T2sLanderFaq = ({ badge, title, description, items, openFirst, emitJsonLd, tone }: Props) => {
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
      <div className="flex flex-col items-center gap-8 md:gap-12">
        <SectionHead badge={badge} title={title} description={description} align="center" dark={dark} />
        <div className="flex w-full max-w-3xl flex-col gap-4">
          {items.map((item, i) => (
            <details
              key={i}
              open={openFirst && i === 0}
              className="group overflow-hidden rounded-[var(--pp-radius-lg)] border"
              style={{
                background: dark ? "rgb(255 255 255 / 0.06)" : "var(--pp-c-background)",
                borderColor: dark ? "rgb(255 255 255 / 0.14)" : "var(--pp-c-border)",
              }}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-3 text-base font-semibold md:px-6 md:py-5 md:text-lg [&::-webkit-details-marker]:hidden">
                {item.question}
                <span aria-hidden className="transition-transform group-open:rotate-45" style={{ color: "var(--pp-c-primary)" }}>
                  +
                </span>
              </summary>
              <p className="pp-muted px-3 pb-3 text-sm leading-relaxed md:px-6 md:pb-6 md:text-base">{item.answer}</p>
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

export default T2sLanderFaq;
