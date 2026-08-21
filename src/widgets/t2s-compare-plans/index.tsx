import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import PlanMatrix from "./matrix";
import type { Props } from "./schema";

const T2sComparePlans = ({ badge, title, description, tone, ...rest }: Props) => (
  <Panel tone={tone}>
    <SectionHead badge={badge} title={title} description={description} align="center" dark={isDarkTone(tone)} />
    <div className="mt-12">
      <PlanMatrix {...rest} dark={isDarkTone(tone)} />
    </div>
  </Panel>
);

export default T2sComparePlans;
