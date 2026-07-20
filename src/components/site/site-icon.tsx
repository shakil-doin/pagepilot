import { getIconSvg } from "@/modules/icons/icon.service";
import { cn } from "@/lib/utils";

type Props = {
  icon: string; // "ph:rocket-launch"
  size?: number;
  className?: string;
};

// Async RSC: inlines the SVG from the installed collection at render time.
// Zero icon-library JavaScript ships to visitors.
const SiteIcon = async ({ icon, size = 24, className }: Props) => {
  if (!icon) return null;
  const svg = await getIconSvg(icon, size);
  if (!svg) return null;
  return (
    <span
      className={cn("inline-flex shrink-0 [&>svg]:block", className)}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default SiteIcon;
