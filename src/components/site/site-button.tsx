import Link from "next/link";
import type { ButtonItem } from "@/widgets/lib";
import { cn } from "@/lib/utils";

type Props = {
  button: ButtonItem;
  size?: "md" | "lg";
  className?: string;
};

// Styled entirely by theme button tokens (.pp-btn-* rules from the theme block).
const SiteButton = ({ button, size = "md", className }: Props) => {
  const { label, link, variant } = button;
  if (!label || !link?.href) return null;

  const classes = cn(
    "inline-flex items-center justify-center font-medium transition-opacity hover:opacity-90",
    size === "md" ? "px-5 py-2.5 text-sm" : "px-7 py-3.5 text-base",
    `pp-btn-${variant ?? "primary"}`,
    className,
  );

  const external = /^https?:\/\//.test(link.href);
  if (external || link.newTab) {
    return (
      <a href={link.href} target={link.newTab ? "_blank" : undefined} rel="noopener noreferrer" className={classes}>
        {label}
      </a>
    );
  }
  return (
    <Link href={link.href} className={classes}>
      {label}
    </Link>
  );
};

export default SiteButton;
