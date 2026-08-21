import { resolveIcons } from "@/components/site/t2s/resolve-icons";
import T2sMarketsRiskControlsView from "./view";
import type { Props } from "./schema";

const T2sMarketsRiskControls = async (props: Props) => {
  const icons = await resolveIcons(props.items.map((item) => item.icon), 40);
  return <T2sMarketsRiskControlsView {...props} icons={icons} />;
};

export default T2sMarketsRiskControls;
