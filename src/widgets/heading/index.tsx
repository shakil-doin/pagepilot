import Section from "@/components/site/section";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const Heading = ({ text, level, align }: Props) => {
  const Tag = level;
  return (
    <Section>
      <Tag
        className={cn(
          "pp-heading",
          align === "center" && "text-center",
          align === "right" && "text-right",
        )}
        style={{ fontSize: `var(--pp-text-${level === "h4" ? "h3" : level})` }}
      >
        {text}
      </Tag>
    </Section>
  );
};

export default Heading;
