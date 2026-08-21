import { widgetMeta } from "@/widgets/lib";
import { heroSchema } from "@/widgets/t2s-shared/hero-schema";
import type { z } from "zod";

export const meta = widgetMeta({
  key: "t2s-compare-hero",
  name: "Comparison Hero",
  category: "Hero",
  description: "Review-page hero: headline, CTAs, a rating block with stats and a contained banner",
});

export const schema = heroSchema({ title: "The best trade copiers, compared", banner: "contained" });

export type Props = z.infer<typeof schema>;
