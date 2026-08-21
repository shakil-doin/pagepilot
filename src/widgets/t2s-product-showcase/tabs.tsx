"use client";

import { useState } from "react";
import SiteButton from "@/components/site/site-button";
import SiteImage from "@/components/site/site-image";
import Glyph from "@/components/site/t2s/glyph";
import { cn } from "@/lib/utils";
import type { ShowcaseTab } from "./schema";

type Props = {
  tabs: ShowcaseTab[];
  icons: (string | null)[];
  dark: boolean;
};

const ShowcaseTabs = ({ tabs, icons, dark }: Props) => {
  const [active, setActive] = useState(0);
  if (tabs.length === 0) return null;
  const tab = tabs[Math.min(active, tabs.length - 1)];

  return (
    <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8">
      <div
        className="flex shrink-0 flex-row gap-2 overflow-x-auto rounded-[var(--pp-radius-lg)] p-3 lg:w-[340px] lg:flex-col lg:overflow-visible lg:p-4"
        style={{ background: dark ? "rgb(255 255 255 / 0.07)" : "var(--pp-c-surface)" }}
        role="tablist"
      >
        {tabs.map((item, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={active === i}
            onClick={() => setActive(i)}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-[var(--pp-radius-md)] px-4 py-3 text-left text-base font-medium transition-colors lg:w-full",
              active === i ? "text-white" : "pp-muted",
            )}
            style={active === i ? { background: "var(--pp-c-primary)" } : undefined}
          >
            <Glyph svg={icons[i]} size={20} />
            <span className="whitespace-nowrap">{item.label}</span>
          </button>
        ))}
      </div>

      <div
        className="grid min-w-0 flex-1 gap-8 rounded-[var(--pp-radius-xl)] p-6 md:p-10 lg:grid-cols-2"
        style={{ background: dark ? "rgb(255 255 255 / 0.07)" : "var(--pp-c-surface)" }}
        role="tabpanel"
      >
        <div className="flex flex-col gap-4">
          <h3 className="pp-heading text-2xl font-semibold md:text-3xl">{tab.title}</h3>
          {tab.description ? <p className="pp-muted leading-relaxed">{tab.description}</p> : null}
          {tab.features.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {tab.features.map((feature, i) => (
                <li key={i} className="pp-muted flex items-start gap-2">
                  <svg
                    viewBox="0 0 20 20"
                    className="mt-1 h-5 w-5 shrink-0"
                    fill="none"
                    stroke="var(--pp-c-primary)"
                    strokeWidth="3"
                    aria-hidden
                  >
                    <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {feature.text}
                </li>
              ))}
            </ul>
          ) : null}
          {tab.buttons.length > 0 ? (
            <div className="mt-auto flex flex-wrap gap-3 pt-4">
              {tab.buttons.map((button, i) => (
                <SiteButton key={i} button={button} />
              ))}
            </div>
          ) : null}
        </div>

        {tab.image?.url ? (
          <SiteImage
            media={tab.image}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="h-auto w-full rounded-[var(--pp-radius-lg)] object-cover"
          />
        ) : null}
      </div>
    </div>
  );
};

export default ShowcaseTabs;
