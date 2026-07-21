import Section from "@/components/site/section";
import { cn } from "@/lib/utils";
import type { Props } from "./schema";

const gaps = { sm: "gap-4", md: "gap-8", lg: "gap-12" };
const aligns = { top: "items-start", center: "items-center", bottom: "items-end" };

// Container widget: the renderer passes each column's rendered children in
// columnSlots. On mobile the columns stack.
const Columns = ({ count, gap, verticalAlign, background, columnSlots = [] }: Props & { columnSlots?: React.ReactNode[] }) => (
  <Section background={background}>
    <div
      className={cn("grid grid-cols-1", gaps[gap], aligns[verticalAlign], {
        "sm:grid-cols-2": count === 2,
        "sm:grid-cols-2 md:grid-cols-3": count === 3,
        "sm:grid-cols-2 md:grid-cols-4": count === 4,
        "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5": count === 5,
        "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6": count === 6,
      })}
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="min-w-0 space-y-6">
          {columnSlots[i]}
        </div>
      ))}
    </div>
  </Section>
);

export default Columns;
