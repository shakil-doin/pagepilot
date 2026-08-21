import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import StatCard from "@/components/site/t2s/stat-card";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const T2sAbout = ({ badge, title, description, align, columns, stats, tone }: Props) => {
  const dark = isDarkTone(tone);

  return (
    <Panel tone={tone}>
      <div className="grid gap-10 md:gap-16 xl:grid-cols-2">
        <SectionHead badge={badge} title={title} description={description} align={align} dark={dark} />
        <div
          className={cn("grid gap-5", {
            "sm:grid-cols-1": columns === 1,
            "sm:grid-cols-2": columns === 2,
            "sm:grid-cols-2 lg:grid-cols-3": columns === 3,
          })}
        >
          {stats.map((stat, i) => (
            <StatCard key={i} stat={stat} dark={dark} />
          ))}
        </div>
      </div>
    </Panel>
  );
};

export default T2sAbout;
