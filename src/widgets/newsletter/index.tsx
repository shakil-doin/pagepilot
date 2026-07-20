import Section from "@/components/site/section";
import NewsletterFormClient from "./form";
import type { Props } from "./schema";

const Newsletter = ({ title, description, submitLabel, background }: Props) => (
  <Section background={background} className="py-14 md:py-20">
    <div className="mx-auto max-w-xl text-center">
      <h2 className="pp-heading" style={{ fontSize: "var(--pp-text-h2)" }}>
        {title}
      </h2>
      {description ? <p className="pp-muted mt-4">{description}</p> : null}
      <div className="mt-8">
        <NewsletterFormClient submitLabel={submitLabel} />
      </div>
    </div>
  </Section>
);

export default Newsletter;
