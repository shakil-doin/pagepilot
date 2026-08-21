import Badge from "@/components/site/t2s/badge";
import { cn } from "@/lib/utils";

type Props = {
  badge?: string;
  title?: string;
  description?: string;
  align?: "center" | "left";
  dark?: boolean;
  heading?: boolean;
  // Short accent rule under the title (the trade2sync authors/legal headings).
  rule?: boolean;
  className?: string;
  children?: React.ReactNode;
};

// badge → title → description, the intro block shared by every t2s section.
const SectionHead = ({
  badge,
  title,
  description,
  align = "center",
  dark = false,
  heading = false,
  rule = false,
  className,
  children,
}: Props) => {
  if (!badge && !title && !description && !children) return null;
  const centered = align === "center";
  const Title = heading ? "h1" : "h2";

  return (
    <div className={cn("flex flex-col", centered && "items-center text-center", className)}>
      {badge ? <Badge tone={dark ? "dark" : "light"}>{badge}</Badge> : null}
      {title ? (
        <Title
          className={cn("pp-heading mt-4 leading-tight", centered && "max-w-3xl")}
          style={{ fontSize: heading ? "var(--pp-text-h1)" : "var(--pp-text-h2)" }}
        >
          {title}
        </Title>
      ) : null}
      {rule ? (
        <span className="mt-3 block h-1 w-24 rounded-full" style={{ background: "var(--pp-c-primary)" }} />
      ) : null}
      {description ? (
        <p className={cn("pp-muted mt-4 text-base leading-relaxed md:text-lg", centered && "max-w-2xl")}>
          {description}
        </p>
      ) : null}
      {children}
    </div>
  );
};

export default SectionHead;
