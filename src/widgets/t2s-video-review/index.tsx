import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import VideoReviewCarousel from "./carousel";
import type { Props } from "./schema";

const T2sVideoReview = ({ badge, title, description, align, videos, tone }: Props) => {
  const dark = isDarkTone(tone);
  return (
    <Panel tone={tone}>
      <SectionHead badge={badge} title={title} description={description} align={align} dark={dark} />
      <div className="mt-8 md:mt-14">
        <VideoReviewCarousel videos={videos} dark={dark} />
      </div>
    </Panel>
  );
};

export default T2sVideoReview;
