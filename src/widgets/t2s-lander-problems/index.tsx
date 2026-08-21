import { resolveIcons } from "@/components/site/t2s/resolve-icons";
import LanderProblemsView from "./view";
import type { Props } from "./schema";

const T2sLanderProblems = async (props: Props) => {
  const icons = await resolveIcons(
    [...props.scenarios.map((scenario) => scenario.icon), ...props.cards.map((card) => card.icon)],
    24,
  );
  return <LanderProblemsView {...props} icons={icons} />;
};

export default T2sLanderProblems;
