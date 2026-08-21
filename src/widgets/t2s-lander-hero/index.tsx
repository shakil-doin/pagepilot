import { resolveIcons } from "@/components/site/t2s/resolve-icons";
import LanderHeroView from "./view";
import type { Props } from "./schema";

const T2sLanderHero = async (props: Props) => {
  const icons = await resolveIcons(props.features.map((feature) => feature.icon), 20);
  return <LanderHeroView {...props} icons={icons} />;
};

export default T2sLanderHero;
