import { resolveIcons } from "@/components/site/t2s/resolve-icons";
import HowTestedView from "./view";
import type { Props } from "./schema";

const T2sCompareHowTested = async (props: Props) => {
  const icons = await resolveIcons(props.cards.map((card) => card.icon), 24);
  return <HowTestedView {...props} icons={icons} />;
};

export default T2sCompareHowTested;
