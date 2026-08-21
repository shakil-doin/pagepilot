import { resolveIcons } from "@/components/site/t2s/resolve-icons";
import ToolsCalculatorsView from "./view";
import type { Props } from "./schema";

const T2sToolsCalculators = async (props: Props) => {
  const icons = await resolveIcons(props.cards.map((card) => card.icon), 20);
  return <ToolsCalculatorsView {...props} icons={icons} />;
};

export default T2sToolsCalculators;
