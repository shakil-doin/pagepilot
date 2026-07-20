import Section from "@/components/site/section";
import ContactFormClient from "./form";
import type { Props } from "./schema";

const ContactForm = ({ title, description, submitLabel, showPhone, showCompany }: Props) => (
  <Section className="py-14 md:py-20">
    <div className="mx-auto max-w-xl">
      {title || description ? (
        <div className="mb-10 text-center">
          {title ? (
            <h2 className="pp-heading" style={{ fontSize: "var(--pp-text-h2)" }}>
              {title}
            </h2>
          ) : null}
          {description ? <p className="pp-muted mt-4">{description}</p> : null}
        </div>
      ) : null}
      <ContactFormClient submitLabel={submitLabel} showPhone={showPhone} showCompany={showCompany} />
    </div>
  </Section>
);

export default ContactForm;
