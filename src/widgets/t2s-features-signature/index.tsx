import { resolveIcons } from "@/components/site/t2s/resolve-icons";
import T2sFeaturesSignatureView from "./view";
import type { Props } from "./schema";

const T2sFeaturesSignature = async (props: Props) => {
  const icons = await resolveIcons(props.items.map((item) => item.icon), 40);
  return <T2sFeaturesSignatureView {...props} icons={icons} />;
};

export default T2sFeaturesSignature;
