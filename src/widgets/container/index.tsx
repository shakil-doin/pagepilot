import Section from "@/components/site/section";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const widths = { full: "", wide: "max-w-4xl mx-auto", narrow: "max-w-2xl mx-auto" };
const gaps = { none: "gap-0", sm: "gap-3", md: "gap-6", lg: "gap-10" };
const justifies = { start: "justify-start", center: "justify-center", end: "justify-end", between: "justify-between" };
const itemsMap = { start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch" };

// Single-slot flex container: the renderer passes the grouped children in
// columnSlots[0]. Direction/justify/align/wrap/gap map straight to flexbox.
const Container = ({
  direction,
  justify,
  items,
  wrap,
  gap,
  width,
  background,
  columnSlots = [],
}: Props & { columnSlots?: React.ReactNode[] }) => (
  <Section background={background}>
    <div
      className={cn(
        "flex",
        direction === "row" ? "flex-row" : "flex-col",
        wrap && "flex-wrap",
        justifies[justify],
        itemsMap[items],
        gaps[gap],
        widths[width],
      )}
    >
      {columnSlots[0]}
    </div>
  </Section>
);

export default Container;
