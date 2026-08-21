import { widgetMeta } from "@/widgets/lib";
import { iconCardsSchema } from "@/widgets/t2s-shared/icon-cards-schema";
import type { z } from "zod";

export const meta = widgetMeta({
  key: "t2s-about-empower",
  name: "Empower Cards",
  category: "Marketing",
  description: "Two-up icon cards under a centered heading and subtitle",
});

export const schema = iconCardsSchema({
  title: "How we empower traders",
  columns: 2,
  iconStyle: "plain",
  tone: "light",
  rule: false,
});

export type Props = z.infer<typeof schema>;
