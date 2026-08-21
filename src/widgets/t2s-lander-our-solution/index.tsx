import { resolveIcons } from "@/components/site/t2s/resolve-icons";
import LanderOurSolutionView from "./view";
import type { Props } from "./schema";

const T2sLanderOurSolution = async (props: Props) => {
  const icons = await resolveIcons(props.steps.map((step) => step.icon), 24);
  return <LanderOurSolutionView {...props} icons={icons} />;
};

export default T2sLanderOurSolution;
