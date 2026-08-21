import { resolveIcons } from "@/components/site/t2s/resolve-icons";
import AuthorsTeamView from "./view";
import type { Props } from "./schema";

const T2sAuthorsTeam = async (props: Props) => {
  const offsets: number[] = [];
  const refs: (string | undefined)[] = [];
  for (const member of props.members) {
    offsets.push(refs.length);
    refs.push(...member.socials.map((social) => social.icon));
  }
  const icons = await resolveIcons(refs, 16);
  return <AuthorsTeamView {...props} icons={icons} socialOffsets={offsets} />;
};

export default T2sAuthorsTeam;
