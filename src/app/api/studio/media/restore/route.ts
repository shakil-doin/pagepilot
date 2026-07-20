import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApi, requireCapability } from "@/modules/auth/rbac";
import { restoreMedia } from "@/modules/media/media.service";

const bodySchema = z.object({ ids: z.array(z.string()).min(1) });

export const POST = (req: NextRequest) =>
  handleApi(async () => {
    const user = await requireCapability("media.manage");
    const { ids } = bodySchema.parse(await req.json());
    await restoreMedia(user.id, ids);
    return { restored: ids.length };
  });
