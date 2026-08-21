import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import type { Props } from "./schema";

const T2sSectionTitle = ({ badge, title, description, align, rule, asPageHeading, tone }: Props) => (
  <Panel tone={tone} padding="md">
    <SectionHead
      badge={badge}
      title={title}
      description={description}
      align={align}
      rule={rule}
      heading={asPageHeading}
      dark={isDarkTone(tone)}
    />
  </Panel>
);

export default T2sSectionTitle;
