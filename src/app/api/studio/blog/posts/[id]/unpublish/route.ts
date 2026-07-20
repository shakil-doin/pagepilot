import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApi, requireCapability } from "@/modules/auth/rbac";
import { unpublishPost } from "@/modules/blog/blog.service";

type Params = { params: Promise<{ id: string }> };

const bodySchema = z.object({ archive: z.boolean().optional() });

export const POST = (req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const { id } = await params;
    const user = await requireCapability("blog.publish");
    const { archive } = bodySchema.parse(await req.json().catch(() => ({})));
    return unpublishPost(user.id, id, archive ?? false);
  });
