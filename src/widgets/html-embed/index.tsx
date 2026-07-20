import Section from "@/components/site/section";
import { sanitizeEmbed } from "@/lib/sanitize";
import type { Props } from "./schema";

// Sanitized at render as defense in depth; the API also sanitizes at save.
const HtmlEmbed = ({ html }: Props) => {
  if (!html) return null;
  return (
    <Section>
      <div dangerouslySetInnerHTML={{ __html: sanitizeEmbed(html) }} />
    </Section>
  );
};

export default HtmlEmbed;
