import { resolveIcons } from "@/components/site/t2s/resolve-icons";
import DeepDiveView from "./view";
import type { Props } from "./schema";

const T2sCompareDeepDive = async (props: Props) => {
  const icons = await resolveIcons(props.cards.map((card) => card.icon), 24);
  return <DeepDiveView {...props} icons={icons} />;
};

export default T2sCompareDeepDive;
