import { widgetMeta } from "@/widgets/lib";
import { schema as planListSchema } from "@/widgets/t2s-plan-list/schema";
import type { z } from "zod";

export const meta = widgetMeta({
  key: "t2s-lander-pricing",
  name: "Lander Pricing",
  category: "Pricing",
  description: "Landing-page pricing block: centered intro over the billing toggle and plan cards",
});

// Same fields as the standalone plan list — the lander variant exists as its own
// palette entry because it is placed and tracked separately on landing pages.
export const schema = planListSchema;

export type Props = z.infer<typeof schema>;
