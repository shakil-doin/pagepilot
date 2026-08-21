import { widgetMeta } from "@/widgets/lib";
import { heroSchema } from "@/widgets/t2s-shared/hero-schema";
import type { z } from "zod";

export const meta = widgetMeta({
  key: "t2s-learn-hub-hero",
  name: "Hub Hero",
  category: "Hero",
  description: "Hub-page hero with rating stats and an edge-to-edge shape banner underneath",
});

export const schema = heroSchema({ title: "Everything you need to know", banner: "full" });

export type Props = z.infer<typeof schema>;
