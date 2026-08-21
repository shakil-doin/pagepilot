import { resolveIcons } from "@/components/site/t2s/resolve-icons";
import AboutCtaView from "./view";
import type { Props } from "./schema";

const T2sAboutCta = async (props: Props) => {
  const [iconSvg] = await resolveIcons([props.icon], 16);
  return <AboutCtaView {...props} iconSvg={iconSvg} />;
};

export default T2sAboutCta;
