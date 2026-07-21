import Section from "@/components/site/section";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const widths = { full: "", wide: "max-w-4xl", narrow: "max-w-2xl" };
const gaps = { none: "", sm: "space-y-3", md: "space-y-6", lg: "space-y-10" };
const aligns = { left: "mr-auto", center: "mx-auto", right: "ml-auto" };

// Single-slot layout container: the renderer passes the grouped children in
// columnSlots[0]. Widgets stack vertically inside a width-constrained box.
const Container = ({
  width,
  gap,
  align,
  background,
  columnSlots = [],
}: Props & { columnSlots?: React.ReactNode[] }) => (
  <Section background={background}>
    <div className={cn(widths[width], gaps[gap], aligns[align], width !== "full" && "w-full")}>
      {columnSlots[0]}
    </div>
  </Section>
);

export default Container;
