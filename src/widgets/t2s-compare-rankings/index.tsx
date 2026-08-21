import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import RankingsTabs from "./tabs";
import type { Props } from "./schema";

const T2sCompareRankings = ({ badge, title, description, tone, ...rest }: Props) => {
  const dark = isDarkTone(tone);
  return (
    <Panel tone={tone}>
      <div className="flex flex-col items-center gap-8 md:gap-14">
        <SectionHead badge={badge} title={title} description={description} align="center" dark={dark} />
        <RankingsTabs {...rest} dark={dark} />
      </div>
    </Panel>
  );
};

export default T2sCompareRankings;
