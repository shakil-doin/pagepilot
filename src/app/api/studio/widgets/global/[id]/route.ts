import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApi, requireSession, requireCapability, ApiAuthError } from "@/modules/auth/rbac";
import {
  getGlobalWidget,
  findPagesUsingGlobal,
  updateGlobalWidget,
  deleteGlobalWidget,
} from "@/modules/widgets/widget.service";

type Params = { params: Promise<{ id: string }> };

export const GET = (_req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const { id } = await params;
    await requireSession();
    const widget = await getGlobalWidget(id);
    if (!widget) throw new ApiAuthError(404, "NOT_FOUND", "Global widget not found");
    const affectedPages = await findPagesUsingGlobal(id);
    return { widget, affectedPages };
  });

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  props: z.record(z.string(), z.unknown()).optional(),
});

export const PATCH = (req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const { id } = await params;
    const user = await requireCapability("widgets.global");
    const body = patchSchema.parse(await req.json());
    return updateGlobalWidget(user.id, id, body);
  });

export const DELETE = (_req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const { id } = await params;
    const user = await requireCapability("widgets.global");
    try {
      await deleteGlobalWidget(user.id, id);
    } catch (err) {
      // Service throws when the widget is still placed on published pages
      throw new ApiAuthError(409, "IN_USE", err instanceof Error ? err.message : "Widget is in use");
    }
    return { deleted: true };
  });
