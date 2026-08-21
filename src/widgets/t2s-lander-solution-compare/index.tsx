import { resolveIcons } from "@/components/site/t2s/resolve-icons";
import SolutionCompareView from "./view";
import type { Props } from "./schema";

const T2sLanderSolutionCompare = async (props: Props) => {
  const icons = await resolveIcons(props.withoutCards.map((card) => card.icon), 20);
  return <SolutionCompareView {...props} icons={icons} />;
};

export default T2sLanderSolutionCompare;
