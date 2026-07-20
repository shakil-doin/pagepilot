import Image from "next/image";
import type { MediaRef } from "@/widgets/lib";
import { cn } from "@/lib/utils";

type Props = {
  media: MediaRef;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  className?: string;
};

// Renders a picked media asset with LQIP blur and focal-point cropping.
const SiteImage = ({ media, sizes, priority = false, fill = false, className }: Props) => {
  if (!media?.url) return null;

  const objectPosition =
    media.focalX != null && media.focalY != null
      ? `${Math.round(media.focalX * 100)}% ${Math.round(media.focalY * 100)}%`
      : undefined;

  if (fill) {
    return (
      <Image
        src={media.url}
        alt={media.alt ?? ""}
        fill
        sizes={sizes ?? "100vw"}
        priority={priority}
        placeholder={media.blurDataUrl ? "blur" : "empty"}
        blurDataURL={media.blurDataUrl}
        className={cn("object-cover", className)}
        style={{ objectPosition }}
      />
    );
  }

  if (!media.width || !media.height) {
    // Unknown intrinsic size (external URL): plain img avoids layout lies
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={media.url} alt={media.alt ?? ""} className={className} loading={priority ? "eager" : "lazy"} />;
  }

  return (
    <Image
      src={media.url}
      alt={media.alt ?? ""}
      width={media.width}
      height={media.height}
      sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
      priority={priority}
      placeholder={media.blurDataUrl ? "blur" : "empty"}
      blurDataURL={media.blurDataUrl}
      className={className}
      style={{ objectPosition }}
    />
  );
};

export default SiteImage;
