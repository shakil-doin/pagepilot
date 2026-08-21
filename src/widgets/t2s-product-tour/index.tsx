import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import CheckList from "@/components/site/t2s/check-list";
import SiteImage from "@/components/site/site-image";
import type { Props } from "./schema";

const T2sProductTour = ({ badge, title, description, align, features, image, embedUrl, tone }: Props) => (
  <Panel tone={tone}>
    <SectionHead badge={badge} title={title} description={description} align={align} dark={isDarkTone(tone)} />
    <CheckList items={features} align={align} className="mt-6 md:mt-8" />

    {embedUrl ? (
      <div
        className="mt-8 aspect-video w-full overflow-hidden rounded-[var(--pp-radius-xl)] border md:mt-14"
        style={{ borderColor: "var(--pp-c-border)" }}
      >
        <iframe
          src={embedUrl}
          title={title}
          loading="lazy"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="h-full w-full border-0"
        />
      </div>
    ) : image?.url ? (
      <SiteImage
        media={image}
        sizes="(max-width: 768px) 100vw, 1100px"
        className="mt-8 h-auto w-full rounded-[var(--pp-radius-xl)] md:mt-14"
      />
    ) : null}
  </Panel>
);

export default T2sProductTour;
