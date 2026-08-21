import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import PlanListClient from "./plans";
import type { Props } from "./schema";

const T2sPlanList = ({ badge, title, description, tone, ...rest }: Props) => (
  <Panel tone={tone}>
    <SectionHead badge={badge} title={title} description={description} align="center" dark={isDarkTone(tone)} />
    <PlanListClient {...rest} dark={isDarkTone(tone)} />
  </Panel>
);

export default T2sPlanList;
