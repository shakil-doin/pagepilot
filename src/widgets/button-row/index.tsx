import Section from "@/components/site/section";
import SiteButton from "@/components/site/site-button";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const ButtonRow = ({ buttons, align, size }: Props) => (
  <Section>
    <div
      className={cn(
        "flex flex-wrap gap-3",
        align === "center" && "justify-center",
        align === "right" && "justify-end",
      )}
    >
      {buttons.map((button, i) => (
        <SiteButton key={i} button={button} size={size} />
      ))}
    </div>
  </Section>
);

export default ButtonRow;
