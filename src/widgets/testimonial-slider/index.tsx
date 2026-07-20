import Section from "@/components/site/section";
import TestimonialSliderClient from "./slider";
import type { Props } from "./schema";

const TestimonialSlider = ({ title, items, background }: Props) => {
  if (items.length === 0) return null;

  return (
    <Section background={background} className="py-14 md:py-20">
      {title ? (
        <h2 className="pp-heading mb-12 text-center" style={{ fontSize: "var(--pp-text-h2)" }}>
          {title}
        </h2>
      ) : null}
      <TestimonialSliderClient items={items} />
    </Section>
  );
};

export default TestimonialSlider;
