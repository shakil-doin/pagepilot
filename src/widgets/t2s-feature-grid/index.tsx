import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const T2sFeatureGrid = ({ badge, title, description, align, columns, items, tone }: Props) => {
  const dark = isDarkTone(tone);

  return (
    <Panel tone={tone}>
      <SectionHead badge={badge} title={title} description={description} align={align} dark={dark} />
      <ul
        className={cn("mt-10 grid w-full gap-5 sm:grid-cols-2 md:mt-14", {
          "lg:grid-cols-2": columns === 2,
          "lg:grid-cols-3": columns === 3,
          "lg:grid-cols-4": columns === 4,
        })}
      >
        {items.map((item, i) => (
          <li
            key={i}
            className="flex flex-col rounded-[var(--pp-radius-lg)] p-6 md:p-8"
            style={{ background: dark ? "rgb(255 255 255 / 0.07)" : "var(--pp-c-surface)" }}
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-[var(--pp-radius-md)] text-sm font-semibold text-white"
              style={{ background: "var(--pp-c-primary)" }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="pp-heading mt-5 text-lg font-semibold md:text-xl">{item.title}</h3>
            {item.description ? <p className="pp-muted mt-2">{item.description}</p> : null}
          </li>
        ))}
      </ul>
    </Panel>
  );
};

export default T2sFeatureGrid;
