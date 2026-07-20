import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApi, requireSession, requireCapability, ApiAuthError } from "@/modules/auth/rbac";
import { getCustomWidget, updateCustomWidget, deleteCustomWidget } from "@/modules/widgets/widget.service";
import type { SectionNode } from "@/types";

type Params = { params: Promise<{ id: string }> };

export const GET = (_req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const { id } = await params;
    await requireSession();
    const widget = await getCustomWidget(id);
    if (!widget) throw new ApiAuthError(404, "NOT_FOUND", "Custom widget not found");
    return widget;
  });

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  tree: z.array(z.unknown()).optional(),
  exposedProps: z.unknown().optional(),
});

export const PATCH = (req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const { id } = await params;
    const user = await requireCapability("widgets.custom");
    const body = patchSchema.parse(await req.json());
    return updateCustomWidget(user.id, id, {
      name: body.name,
      description: body.description,
      tree: body.tree as SectionNode[] | undefined,
      exposedProps: body.exposedProps,
    });
  });

export const DELETE = (_req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const { id } = await params;
    const user = await requireCapability("widgets.custom");
    await deleteCustomWidget(user.id, id);
    return { deleted: true };
  });
