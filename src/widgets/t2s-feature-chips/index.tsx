import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const T2sFeatureChips = ({ items, align, tone }: Props) => {
  const dark = isDarkTone(tone);
  if (items.length === 0) return null;

  return (
    <Panel tone={tone} padding="sm">
      <ul className={cn("flex flex-wrap items-center gap-2 md:gap-3", align === "center" && "justify-center")}>
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium md:px-4 md:text-base"
            style={{ background: dark ? "rgb(255 255 255 / 0.1)" : "var(--pp-c-surface)" }}
          >
            <span className="shrink-0" style={{ color: "var(--pp-c-primary)" }} aria-hidden>
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            {item.text}
          </li>
        ))}
      </ul>
    </Panel>
  );
};

export default T2sFeatureChips;
