import { cn } from "@/lib/utils";
import Container from "@/components/site/container";

type Props = {
  background?: "none" | "surface" | "primary" | "secondary";
  children: React.ReactNode;
  className?: string;
  contained?: boolean;
};

// Full-bleed background, contained content. Dark backgrounds flip text color
// via the pp-on-dark class defined in site.css.
const Section = ({ background = "none", children, className, contained = true }: Props) => (
  <section
    className={cn(
      background === "surface" && "pp-bg-surface",
      background === "primary" && "pp-bg-primary pp-on-dark",
      background === "secondary" && "pp-bg-secondary pp-on-dark",
      className,
    )}
  >
    {contained ? <Container>{children}</Container> : children}
  </section>
);

export default Section;
