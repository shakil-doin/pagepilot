import { resolveIcons } from "@/components/site/t2s/resolve-icons";
import LanderSolutionsView from "./view";
import type { Props } from "./schema";

const T2sLanderSolutions = async (props: Props) => {
  const icons = await resolveIcons(props.solutions.map((solution) => solution.icon), 24);
  return <LanderSolutionsView {...props} icons={icons} />;
};

export default T2sLanderSolutions;
