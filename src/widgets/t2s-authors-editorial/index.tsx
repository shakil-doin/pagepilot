import { resolveIcons } from "@/components/site/t2s/resolve-icons";
import T2sAuthorsEditorialView from "./view";
import type { Props } from "./schema";

const T2sAuthorsEditorial = async (props: Props) => {
  const icons = await resolveIcons(props.items.map((item) => item.icon), 40);
  return <T2sAuthorsEditorialView {...props} icons={icons} />;
};

export default T2sAuthorsEditorial;
