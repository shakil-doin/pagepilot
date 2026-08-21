import { widgetMeta } from "@/widgets/lib";
import { heroSchema } from "@/widgets/t2s-shared/hero-schema";
import type { z } from "zod";

export const meta = widgetMeta({
  key: "t2s-learn-hero",
  name: "Guide Hero",
  category: "Hero",
  description: "Guide-page hero: headline, CTAs, feature checks and a contained illustration",
});

export const schema = heroSchema({ title: "Learn how trade copying works", banner: "contained" });

export type Props = z.infer<typeof schema>;
