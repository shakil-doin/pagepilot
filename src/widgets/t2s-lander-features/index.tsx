import { resolveIcons } from "@/components/site/t2s/resolve-icons";
import LanderFeaturesView from "./view";
import type { Props } from "./schema";

const T2sLanderFeatures = async (props: Props) => {
  const icons = await resolveIcons(props.items.map((item) => item.icon), 20);
  return <LanderFeaturesView {...props} icons={icons} />;
};

export default T2sLanderFeatures;
