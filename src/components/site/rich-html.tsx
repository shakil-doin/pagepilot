import { cn } from "@/lib/utils";

type Props = {
  html: string;
  className?: string;
};

// Rich text is sanitized at save time (see lib/sanitize.ts); this only renders.
const RichHtml = ({ html, className }: Props) => (
  <div className={cn("pp-prose", className)} dangerouslySetInnerHTML={{ __html: html }} />
);

export default RichHtml;
