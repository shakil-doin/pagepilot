import { NextRequest } from "next/server";
import { handleApi, requireCapability } from "@/modules/auth/rbac";
import { publishPost } from "@/modules/blog/blog.service";

type Params = { params: Promise<{ id: string }> };

export const POST = (_req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const { id } = await params;
    const user = await requireCapability("blog.publish");
    return publishPost(user.id, id);
  });
