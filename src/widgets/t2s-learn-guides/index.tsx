import { resolveIcons } from "@/components/site/t2s/resolve-icons";
import LearnGuidesView from "./view";
import type { Props } from "./schema";

const T2sLearnGuides = async (props: Props) => {
  const icons = await resolveIcons(props.cards.map((card) => card.icon), 24);
  return <LearnGuidesView {...props} icons={icons} />;
};

export default T2sLearnGuides;
