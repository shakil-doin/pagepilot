import Panel from "@/components/site/t2s/panel";
import RichHtml from "@/components/site/rich-html";
import SiteImage from "@/components/site/site-image";
import type { Props } from "./schema";

const T2sAuthorsHero = ({ title, body, image, tone }: Props) => (
  <Panel tone={tone}>
    <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
      <div>
        <h1 className="pp-heading leading-tight" style={{ fontSize: "var(--pp-text-h1)" }}>
          {title}
        </h1>
        {body ? (
          <div className="mt-6">
            <RichHtml html={body} />
          </div>
        ) : null}
      </div>
      {image?.url ? (
        <div className="rounded-[var(--pp-radius-xl)] border p-2 md:p-3" style={{ borderColor: "var(--pp-c-border)" }}>
          <SiteImage
            media={image}
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="h-auto w-full rounded-[var(--pp-radius-lg)] object-cover"
          />
        </div>
      ) : null}
    </div>
  </Panel>
);

export default T2sAuthorsHero;
