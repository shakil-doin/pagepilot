import { resolveIcons } from "@/components/site/t2s/resolve-icons";
import MarketsProblemsView from "./view";
import type { Props } from "./schema";

const T2sMarketsProblems = async (props: Props) => {
  const icons = await resolveIcons(props.problems.map((problem) => problem.icon), 24);
  return <MarketsProblemsView {...props} icons={icons} />;
};

export default T2sMarketsProblems;
