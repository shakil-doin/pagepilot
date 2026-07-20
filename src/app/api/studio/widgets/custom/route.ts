import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApi, requireSession, requireCapability } from "@/modules/auth/rbac";
import { listCustomWidgets, createCustomWidget } from "@/modules/widgets/widget.service";
import type { SectionNode } from "@/types";

export const GET = () =>
  handleApi(async () => {
    await requireSession();
    return listCustomWidgets();
  });

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  tree: z.array(z.unknown()),
  exposedProps: z.unknown().optional(),
});

export const POST = (req: NextRequest) =>
  handleApi(async () => {
    const user = await requireCapability("widgets.custom");
    const body = createSchema.parse(await req.json());
    return createCustomWidget(user.id, {
      name: body.name,
      description: body.description,
      tree: body.tree as SectionNode[],
      exposedProps: body.exposedProps,
    });
  });
