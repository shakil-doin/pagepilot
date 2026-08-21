import IconCardsSection from "@/widgets/t2s-shared/icon-cards-section";
import type { Props } from "./schema";

const T2sAboutValuesView = (props: Props & { icons?: (string | null)[] }) => <IconCardsSection {...props} />;

export default T2sAboutValuesView;
