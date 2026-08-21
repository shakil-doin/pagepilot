import { widgetMeta } from "@/widgets/lib";
import { iconCardsSchema } from "@/widgets/t2s-shared/icon-cards-schema";
import type { z } from "zod";

export const meta = widgetMeta({
  key: "t2s-about-values",
  name: "Value Cards",
  category: "Marketing",
  description: "Four-up icon cards spelling out company values",
});

export const schema = iconCardsSchema({
  title: "Our values",
  columns: 4,
  iconStyle: "plain",
  tone: "light",
  rule: false,
});

export type Props = z.infer<typeof schema>;
