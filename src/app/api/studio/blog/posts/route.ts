import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApi, requireCapability } from "@/modules/auth/rbac";
import { listPosts, createPost } from "@/modules/blog/blog.service";
import type { PostStatus } from "@/generated/prisma/enums";

export const GET = (req: NextRequest) =>
  handleApi(async () => {
    await requireCapability("blog.draft");
    const params = req.nextUrl.searchParams;
    return listPosts({
      query: params.get("query") ?? undefined,
      status: (params.get("status") as PostStatus) || undefined,
      page: Number(params.get("page")) || 1,
    });
  });

const createSchema = z.object({ title: z.string().min(1), slug: z.string().optional() });

export const POST = (req: NextRequest) =>
  handleApi(async () => {
    const user = await requireCapability("blog.draft");
    const body = createSchema.parse(await req.json());
    return createPost(user.id, body);
  });
