import Section from "@/components/site/section";
import SiteImage from "@/components/site/site-image";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const ImageWidget = ({ media, caption, width, rounded }: Props) => {
  if (!media?.url) return null;
  return (
    <Section>
      <figure className={cn("mx-auto", width === "wide" && "max-w-4xl", width === "narrow" && "max-w-2xl")}>
        <SiteImage
          media={media}
          sizes={width === "full" ? "100vw" : "(max-width: 768px) 100vw, 896px"}
          className={cn("h-auto w-full", rounded && "rounded-[var(--pp-radius-lg)]")}
        />
        {caption ? (
          <figcaption className="pp-muted mt-2 text-center text-sm">{caption}</figcaption>
        ) : null}
      </figure>
    </Section>
  );
};

export default ImageWidget;
