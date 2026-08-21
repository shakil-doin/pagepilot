import Carousel from "@/components/site/t2s/carousel";
import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import ReviewCard from "@/components/site/t2s/review-card";
import SectionHead from "@/components/site/t2s/section-head";
import StatCard from "@/components/site/t2s/stat-card";
import type { Props } from "./schema";

const T2sSupport = ({ badge, title, description, stats, reviews, tone }: Props) => {
  const dark = isDarkTone(tone);

  return (
    <Panel tone={tone}>
      <div
        className="grid items-center gap-10 rounded-[var(--pp-radius-xl)] border p-6 sm:p-10 lg:grid-cols-2 lg:gap-16 lg:p-14"
        style={{
          background: dark ? "rgb(255 255 255 / 0.06)" : "var(--pp-c-background)",
          borderColor: dark ? "rgb(255 255 255 / 0.14)" : "var(--pp-c-border)",
        }}
      >
        <div>
          <SectionHead badge={badge} title={title} description={description} align="left" dark={dark} />
          {stats.length > 0 ? (
            <div className="mt-8 grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <StatCard key={i} stat={stat} dark={dark} size="sm" />
              ))}
            </div>
          ) : null}
        </div>

        {reviews.length > 0 ? (
          <Carousel dark={dark} itemClassName="w-full basis-full">
            {reviews.map((review, i) => (
              <ReviewCard key={i} review={review} dark={dark} />
            ))}
          </Carousel>
        ) : null}
      </div>
    </Panel>
  );
};

export default T2sSupport;
