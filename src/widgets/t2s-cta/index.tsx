import Link from "next/link";
import Panel from "@/components/site/t2s/panel";
import SiteButton from "@/components/site/site-button";
import SiteImage from "@/components/site/site-image";
import type { Props } from "./schema";

const T2sCta = ({ title, description, buttons, storeLabel, stores, image, tone, rounded }: Props) => (
    <Panel tone={tone} rounded={rounded} padding="md">
      <div className="grid items-end gap-8 md:py-6 xl:grid-cols-[1.5fr_1fr] xl:gap-16">
        <div className="flex flex-col justify-center py-4">
          <h2 className="pp-heading leading-tight" style={{ fontSize: "var(--pp-text-h2)" }}>
            {title}
          </h2>
          {description ? <p className="pp-muted mt-4 leading-relaxed">{description}</p> : null}

          {buttons.length > 0 ? (
            <div className="mt-6 flex w-full flex-wrap gap-3 md:mt-8 md:gap-4">
              {buttons.map((button, i) => (
                <SiteButton key={i} button={button} size="lg" className="w-full md:w-auto" />
              ))}
            </div>
          ) : null}

          {stores.length > 0 ? (
            <div className="mt-8 md:mt-10">
              {storeLabel ? (
                <p className="pp-muted text-sm font-semibold uppercase tracking-wide md:text-base">{storeLabel}</p>
              ) : null}
              <div className="mt-4 flex flex-wrap items-center gap-4">
                {stores.map((store, i) => {
                  const badge = store.badge?.url ? (
                    <SiteImage media={store.badge} sizes="200px" className="h-11 w-auto md:h-13" />
                  ) : (
                    <span className="px-4 py-2 text-sm font-medium">{store.label}</span>
                  );

                  if (store.comingSoon) {
                    return (
                      <span
                        key={i}
                        aria-disabled
                        className="relative inline-flex cursor-not-allowed overflow-hidden rounded-[var(--pp-radius-md)] bg-white"
                      >
                        <span className="opacity-40 grayscale">{badge}</span>
                        <span
                          className="absolute right-1 top-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white"
                          style={{ background: "var(--pp-c-secondary)" }}
                        >
                          Coming soon
                        </span>
                      </span>
                    );
                  }

                  return (
                    <Link
                      key={i}
                      href={store.link.href}
                      target={store.link.newTab ? "_blank" : undefined}
                      rel={store.link.newTab ? "noopener noreferrer" : undefined}
                      className="inline-flex overflow-hidden rounded-[var(--pp-radius-md)] bg-white transition-transform hover:scale-105"
                    >
                      {badge}
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        {image?.url ? (
          <div className="flex items-end justify-center xl:justify-end">
            <SiteImage
              media={image}
              sizes="(max-width: 1280px) 60vw, 420px"
              className="h-auto w-full max-w-[420px] object-contain"
            />
          </div>
        ) : null}
      </div>
    </Panel>
  );

export default T2sCta;
