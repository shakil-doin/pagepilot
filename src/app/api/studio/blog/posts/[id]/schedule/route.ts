import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApi, requireCapability } from "@/modules/auth/rbac";
import { schedulePost } from "@/modules/blog/blog.service";

type Params = { params: Promise<{ id: string }> };

const bodySchema = z.object({ when: z.iso.datetime({ offset: true, local: true }) });

export const POST = (req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const { id } = await params;
    const user = await requireCapability("blog.publish");
    const { when } = bodySchema.parse(await req.json());
    return schedulePost(user.id, id, new Date(when));
  });
