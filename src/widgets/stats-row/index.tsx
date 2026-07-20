import Section from "@/components/site/section";
import SiteIcon from "@/components/site/site-icon";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const StatsRow = ({ items, columns, background }: Props) => (
  <Section background={background} className="py-14 md:py-20">
    <div
      className={cn("grid grid-cols-2 gap-8 text-center", {
        "md:grid-cols-2": columns === 2,
        "md:grid-cols-3": columns === 3,
        "md:grid-cols-4": columns === 4,
      })}
    >
      {items.map((item, i) => (
        <div key={i}>
          {item.icon ? (
            <div className="mb-3 flex justify-center" style={{ color: "var(--pp-c-primary)" }}>
              <SiteIcon icon={item.icon} size={28} />
            </div>
          ) : null}
          <p className="pp-heading text-4xl font-bold">{item.value}</p>
          <p className="pp-muted mt-1">{item.label}</p>
        </div>
      ))}
    </div>
  </Section>
);

export default StatsRow;
