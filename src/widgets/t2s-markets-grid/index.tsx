import { resolveIcons } from "@/components/site/t2s/resolve-icons";
import MarketsGridView from "./view";
import type { Props } from "./schema";

const T2sMarketsGrid = async (props: Props) => {
  const icons = await resolveIcons(props.cards.map((card) => card.icon), 24);
  return <MarketsGridView {...props} icons={icons} />;
};

export default T2sMarketsGrid;
