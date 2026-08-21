import { resolveIcons } from "@/components/site/t2s/resolve-icons";
import AboutHeroView from "./view";
import type { Props } from "./schema";

const T2sAboutHero = async (props: Props) => {
  const icons = await resolveIcons(props.badges.map((badge) => badge.icon), 14);
  return <AboutHeroView {...props} icons={icons} />;
};

export default T2sAboutHero;
