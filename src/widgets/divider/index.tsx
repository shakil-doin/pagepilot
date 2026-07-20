import Section from "@/components/site/section";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const Divider = ({ width }: Props) => (
  <Section>
    <hr className={cn("border-0 border-t", width === "narrow" && "mx-auto max-w-md")} style={{ borderColor: "var(--pp-c-border)" }} />
  </Section>
);

export default Divider;
