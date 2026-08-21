import { widgetMeta } from "@/widgets/lib";
import { statementSchema } from "@/widgets/t2s-shared/statement-schema";
import type { z } from "zod";

export const meta = widgetMeta({
  key: "t2s-about-mission",
  name: "Mission Statement",
  category: "Content",
  description: "Centered mission statement on a tinted band",
});

export const schema = statementSchema({ title: "Our mission", tone: "surface" });

export type Props = z.infer<typeof schema>;
