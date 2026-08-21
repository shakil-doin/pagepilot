import Panel from "@/components/site/t2s/panel";
import SiteImage from "@/components/site/site-image";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const T2sPartnersStrip = ({ title, items, grayscale, tone }: Props) => {
  if (items.length === 0) return null;

  return (
    <Panel tone={tone} padding="md">
      {title ? (
        <h2 className="pp-heading w-full text-center text-2xl font-semibold md:text-[32px]">{title}</h2>
      ) : null}
      <div
        className="mt-10 grid grid-cols-2 border-y sm:grid-cols-3 lg:grid-cols-5"
        style={{ borderColor: "var(--pp-c-border)" }}
      >
        {items.map((partner, i) => (
          <div
            key={i}
            className={cn("flex min-w-0 items-center justify-center px-6 py-10 lg:px-10", i > 0 && "border-l")}
            style={{ borderColor: "var(--pp-c-border)" }}
          >
            {partner.logo?.url ? (
              <SiteImage
                media={partner.logo}
                sizes="200px"
                className={cn("h-12 w-auto max-w-full object-contain", grayscale && "opacity-70 grayscale")}
              />
            ) : (
              <span className="pp-muted text-sm">{partner.name}</span>
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
};

export default T2sPartnersStrip;
