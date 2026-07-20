import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApi, requireSession, requireCapability } from "@/modules/auth/rbac";
import { listGlobalWidgets, createGlobalWidget } from "@/modules/widgets/widget.service";

export const GET = () =>
  handleApi(async () => {
    await requireSession();
    return listGlobalWidgets();
  });

const createSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  props: z.record(z.string(), z.unknown()),
});

export const POST = (req: NextRequest) =>
  handleApi(async () => {
    const user = await requireCapability("widgets.global");
    const body = createSchema.parse(await req.json());
    return createGlobalWidget(user.id, body);
  });
