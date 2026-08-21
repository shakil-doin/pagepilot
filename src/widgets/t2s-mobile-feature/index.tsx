import { resolveIcons } from "@/components/site/t2s/resolve-icons";
import MobileFeatureView from "./view";
import type { Props } from "./schema";

// Icon SVGs are inlined from the icon database here so the view stays a plain
// component the builder canvas can also render.
const T2sMobileFeature = async (props: Props) => {
  const icons = await resolveIcons(props.cards.map((card) => card.icon), 28);
  return <MobileFeatureView {...props} icons={icons} />;
};

export default T2sMobileFeature;
