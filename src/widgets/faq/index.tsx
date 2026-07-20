import Section from "@/components/site/section";
import type { Props } from "./schema";

// Native <details> keeps the accordion JS-free; FAQ JSON-LD is emitted inline.
const Faq = ({ title, items, background }: Props) => {
  if (items.length === 0) return null;

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
    <Section background={background} className="py-14 md:py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="pp-heading mb-8 text-center" style={{ fontSize: "var(--pp-text-h2)" }}>
          {title}
        </h2>
        <div className="divide-y" style={{ borderColor: "var(--pp-c-border)" }}>
          {items.map((item, i) => (
            <details key={i} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                {item.question}
                <span aria-hidden className="transition-transform group-open:rotate-45" style={{ color: "var(--pp-c-primary)" }}>
                  +
                </span>
              </summary>
              <p className="pp-muted mt-3 leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </Section>
  );
};

export default Faq;
