import Link from "next/link";
import Section from "@/components/site/section";
import SiteIcon from "@/components/site/site-icon";
import SiteImage from "@/components/site/site-image";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const FeatureGrid = ({ title, description, columns, items, background }: Props) => (
  <Section background={background} className="py-14 md:py-20">
    {title || description ? (
      <div className="mx-auto mb-12 max-w-2xl text-center">
        {title ? (
          <h2 className="pp-heading" style={{ fontSize: "var(--pp-text-h2)" }}>
            {title}
          </h2>
        ) : null}
        {description ? <p className="pp-muted mt-4 text-lg">{description}</p> : null}
      </div>
    ) : null}
    <div
      className={cn("grid grid-cols-1 gap-8 sm:grid-cols-2", {
        "lg:grid-cols-2": columns === 2,
        "lg:grid-cols-3": columns === 3,
        "lg:grid-cols-4": columns === 4,
      })}
    >
      {items.map((item, i) => {
        const card = (
          <div className="h-full rounded-[var(--pp-radius-lg)] border p-6" style={{ borderColor: "var(--pp-c-border)" }}>
            {item.image?.url ? (
              <SiteImage media={item.image} sizes="400px" className="mb-4 h-40 w-full rounded-[var(--pp-radius-md)] object-cover" />
            ) : item.icon ? (
              <div className="mb-4" style={{ color: "var(--pp-c-primary)" }}>
                <SiteIcon icon={item.icon} size={32} />
              </div>
            ) : null}
            <h3 className="pp-heading text-lg font-semibold">{item.title}</h3>
            {item.text ? <p className="pp-muted mt-2 leading-relaxed">{item.text}</p> : null}
          </div>
        );
        return item.link?.href ? (
          <Link key={i} href={item.link.href} className="block transition-transform hover:-translate-y-0.5">
            {card}
          </Link>
        ) : (
          <div key={i}>{card}</div>
        );
      })}
    </div>
  </Section>
);

export default FeatureGrid;
