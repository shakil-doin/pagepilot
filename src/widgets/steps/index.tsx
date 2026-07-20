import Section from "@/components/site/section";
import SiteIcon from "@/components/site/site-icon";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const Steps = ({ title, items, layout, numbered, background }: Props) => (
  <Section background={background} className="py-14 md:py-20">
    {title ? (
      <h2 className="pp-heading mb-12 text-center" style={{ fontSize: "var(--pp-text-h2)" }}>
        {title}
      </h2>
    ) : null}
    <ol className={cn("flex flex-col gap-10", layout === "horizontal" && "md:flex-row md:gap-8")}>
      {items.map((item, i) => (
        <li key={i} className={cn("flex gap-4", layout === "horizontal" && "md:flex-1 md:flex-col")}>
          {numbered ? (
            <span
              className="pp-on-dark flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-semibold"
              style={{ background: "var(--pp-c-primary)" }}
              aria-hidden
            >
              {i + 1}
            </span>
          ) : item.icon ? (
            <span className="shrink-0" style={{ color: "var(--pp-c-primary)" }}>
              <SiteIcon icon={item.icon} size={28} />
            </span>
          ) : null}
          <div>
            <h3 className="pp-heading text-lg font-semibold">{item.title}</h3>
            {item.text ? <p className="pp-muted mt-2 leading-relaxed">{item.text}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  </Section>
);

export default Steps;
