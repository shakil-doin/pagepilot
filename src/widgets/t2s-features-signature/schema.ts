import { widgetMeta } from "@/widgets/lib";
import { iconCardsSchema } from "@/widgets/t2s-shared/icon-cards-schema";
import type { z } from "zod";

export const meta = widgetMeta({
  key: "t2s-features-signature",
  name: "Signature Features",
  category: "Marketing",
  description: "Icon cards for the features that define the product",
});

export const schema = iconCardsSchema({
  title: "Signature features",
  columns: 3,
  iconStyle: "soft",
  tone: "light",
  rule: false,
});

export type Props = z.infer<typeof schema>;
