import Section from "@/components/site/section";
import RichHtml from "@/components/site/rich-html";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const RichText = ({ html, maxWidth, background }: Props) => (
  <Section background={background}>
    <RichHtml html={html} className={cn(maxWidth === "prose" && "mx-auto max-w-[72ch]")} />
  </Section>
);

export default RichText;
