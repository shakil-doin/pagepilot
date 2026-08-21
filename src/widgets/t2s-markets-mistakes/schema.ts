import { widgetMeta } from "@/widgets/lib";
import { iconCardsSchema } from "@/widgets/t2s-shared/icon-cards-schema";
import type { z } from "zod";

export const meta = widgetMeta({
  key: "t2s-markets-mistakes",
  name: "Common Mistakes",
  category: "Education",
  description: "Warning-toned cards listing the mistakes to avoid",
});

export const schema = iconCardsSchema({
  title: "Common mistakes to avoid",
  columns: 3,
  iconStyle: "soft",
  tone: "light",
  rule: false,
});

export type Props = z.infer<typeof schema>;
