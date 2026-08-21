import { resolveIcons } from "@/components/site/t2s/resolve-icons";
import ProductShowcaseView from "./view";
import type { Props } from "./schema";

const T2sProductShowcase = async (props: Props) => {
  const icons = await resolveIcons(props.tabs.map((tab) => tab.icon), 20);
  return <ProductShowcaseView {...props} icons={icons} />;
};

export default T2sProductShowcase;
