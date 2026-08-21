import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import RichHtml from "@/components/site/rich-html";
import SectionHead from "@/components/site/t2s/section-head";
import SiteImage from "@/components/site/site-image";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const T2sAboutStory = ({ title, body, image, imagePosition, align, tone }: Props) => {
  const dark = isDarkTone(tone);
  const split = Boolean(image?.url) && imagePosition !== "above";

  const text = (
    <div>
      <SectionHead title={title} align={align} dark={dark} />
      {body ? (
        <div className={cn("mt-5", align === "center" && !split && "mx-auto max-w-3xl text-left")}>
          <RichHtml html={body} />
        </div>
      ) : null}
    </div>
  );

  const picture = image?.url ? (
    <div className="rounded-[var(--pp-radius-xl)] border p-2 md:p-3" style={{ borderColor: "var(--pp-c-border)" }}>
      <SiteImage
        media={image}
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="h-auto w-full rounded-[var(--pp-radius-lg)] object-cover"
      />
    </div>
  ) : null;

  return (
    <Panel tone={tone}>
      {imagePosition === "above" && picture ? <div className="mb-10">{picture}</div> : null}
      {split ? (
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
          {imagePosition === "left" ? (
            <>
              {picture}
              {text}
            </>
          ) : (
            <>
              {text}
              {picture}
            </>
          )}
        </div>
      ) : (
        text
      )}
    </Panel>
  );
};

export default T2sAboutStory;
