import { widgetMeta } from "@/widgets/lib";
import { iconCardsSchema } from "@/widgets/t2s-shared/icon-cards-schema";
import type { z } from "zod";

export const meta = widgetMeta({
  key: "t2s-markets-risk-controls",
  name: "Risk Control Cards",
  category: "Marketing",
  description: "Three-up icon cards describing risk controls",
});

export const schema = iconCardsSchema({
  title: "Risk controls that protect you",
  columns: 3,
  iconStyle: "soft",
  tone: "light",
  rule: false,
});

export type Props = z.infer<typeof schema>;
