import IconCards, { type IconStyle } from "@/components/site/t2s/icon-cards";
import Panel, { isDarkTone, type Tone } from "@/components/site/t2s/panel";
import SectionHead from "@/components/site/t2s/section-head";

export type IconCardsSectionProps = {
  badge?: string;
  title?: string;
  description?: string;
  align?: "center" | "left";
  rule?: boolean;
  columns: number;
  iconStyle: IconStyle;
  items: { icon?: string; title: string; description?: string }[];
  tone: Tone;
  icons?: (string | null)[];
};

// Shared body for every "intro + grid of icon cards" section ported from
// trade2sync (About Empower/Values, Authors Editorial, Markets, Compare …).
const IconCardsSection = ({
  badge,
  title,
  description,
  align = "center",
  rule = false,
  columns,
  iconStyle,
  items,
  tone,
  icons = [],
}: IconCardsSectionProps) => {
  const dark = isDarkTone(tone);
  return (
    <Panel tone={tone}>
      <SectionHead badge={badge} title={title} description={description} align={align} rule={rule} dark={dark} />
      <IconCards
        items={items}
        icons={icons}
        columns={columns}
        align={align}
        iconStyle={iconStyle}
        dark={dark}
        className="mt-10 md:mt-14"
      />
    </Panel>
  );
};

export default IconCardsSection;
