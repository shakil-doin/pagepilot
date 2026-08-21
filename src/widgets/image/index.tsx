import Section from "@/components/site/section";
import SiteImage from "@/components/site/site-image";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const ImageWidget = ({ media, caption, width, rounded }: Props) => {
  // Editor placeholder: keeps a not-yet-configured image widget visible and
  // clickable so it can be selected and given a file. Publish validation blocks
  // an empty image, so this never reaches a live page.
  if (!media?.url) {
    return (
      <Section>
        <figure className={cn("mx-auto", width === "wide" && "max-w-4xl", width === "narrow" && "max-w-2xl")}>
          <div
            className={cn(
              "flex aspect-video w-full items-center justify-center border-2 border-dashed text-sm",
              rounded && "rounded-[var(--pp-radius-lg)]",
            )}
            style={{ borderColor: "var(--pp-border)", background: "var(--pp-surface)", color: "var(--pp-text-muted)" }}
          >
            Pick an image in the inspector
          </div>
        </figure>
      </Section>
    );
  }
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
