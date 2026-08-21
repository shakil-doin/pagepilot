import { widgetMeta } from "@/widgets/lib";
import { iconCardsSchema } from "@/widgets/t2s-shared/icon-cards-schema";
import type { z } from "zod";

export const meta = widgetMeta({
  key: "t2s-authors-editorial",
  name: "Editorial Standards",
  category: "Content",
  description: "Gradient-circle icon cards describing editorial standards",
});

export const schema = iconCardsSchema({
  title: "Our editorial standards",
  columns: 4,
  iconStyle: "circle",
  tone: "light",
  rule: true,
});

export type Props = z.infer<typeof schema>;
