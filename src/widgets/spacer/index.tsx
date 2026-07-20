import type { Props } from "./schema";

const sizes = { sm: "var(--pp-space-sectionSm)", md: "var(--pp-space-sectionMd)", lg: "var(--pp-space-sectionLg)" };

const Spacer = ({ size }: Props) => <div aria-hidden style={{ height: sizes[size] }} />;

export default Spacer;
