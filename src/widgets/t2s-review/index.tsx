import Marquee from "@/components/site/t2s/marquee";
import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import ReviewCard from "@/components/site/t2s/review-card";
import SectionHead from "@/components/site/t2s/section-head";
import { TagBadge } from "@/components/site/t2s/badge";
import type { Props } from "./schema";

const T2sReview = ({ badge, title, description, align, tagLabel, tagText, rowOne, rowTwo, speed, tone, rounded }: Props) => {
  const dark = isDarkTone(tone);
  const rows = [
    { items: rowOne, direction: "left" as const },
    { items: rowTwo, direction: "right" as const },
  ].filter((row) => row.items.length > 0);

  return (
    <Panel tone={tone} rounded={rounded} contained={false}>
      <div className="px-5 md:px-8">
        <SectionHead badge={badge} title={title} description={description} align={align} dark={dark} />
        {tagLabel ? (
          <div className="mt-6 flex justify-center">
            <TagBadge tag={tagLabel} tone={dark ? "dark" : "light"}>
              {tagText}
            </TagBadge>
          </div>
        ) : null}
      </div>

      <div className="mt-10 space-y-4 md:mt-14 lg:space-y-6">
        {rows.map((row, i) => (
          <Marquee key={i} direction={row.direction} speed={speed}>
            {row.items.map((review, j) => (
              <ReviewCard key={j} review={review} dark={dark} className="h-full" />
            ))}
          </Marquee>
        ))}
      </div>
    </Panel>
  );
};

export default T2sReview;
