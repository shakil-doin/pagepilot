import Panel, { isDarkTone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";
import ShowcaseTabs from "./tabs";
import type { Props } from "./schema";

const ProductShowcaseView = ({
  badge,
  title,
  description,
  tabs,
  tone,
  icons = [],
}: Props & { icons?: (string | null)[] }) => {
  const dark = isDarkTone(tone);

  return (
    <Panel tone={tone}>
      <div className="flex flex-col items-center gap-10 md:gap-16">
        <SectionHead badge={badge} title={title} description={description} align="center" dark={dark} />
        <ShowcaseTabs tabs={tabs} icons={icons} dark={dark} />
      </div>
    </Panel>
  );
};

export default ProductShowcaseView;
