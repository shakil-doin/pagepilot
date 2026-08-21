import { widgetMeta } from "@/widgets/lib";
import { statementSchema } from "@/widgets/t2s-shared/statement-schema";
import type { z } from "zod";

export const meta = widgetMeta({
  key: "t2s-about-vision",
  name: "Vision Statement",
  category: "Content",
  description: "Centered vision statement on a tinted band",
});

export const schema = statementSchema({ title: "Our vision", tone: "surface" });

export type Props = z.infer<typeof schema>;
