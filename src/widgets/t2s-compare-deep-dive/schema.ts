import { widgetMeta } from "@/widgets/lib";
import { schema as whyChooseSchema } from "@/widgets/t2s-compare-why-choose/schema";
import type { z } from "zod";

export const meta = widgetMeta({
  key: "t2s-compare-deep-dive",
  name: "Deep Dive Rows",
  category: "Compare",
  description: "Icon cards stacked as wide rows beside a showcase tile, closing with checks and a CTA",
});

// Same content model as the Why Choose mosaic; only the layout differs.
export const schema = whyChooseSchema;

export type Props = z.infer<typeof schema>;
