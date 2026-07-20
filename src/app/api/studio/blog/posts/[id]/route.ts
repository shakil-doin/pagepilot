import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApi, requireCapability, ApiAuthError } from "@/modules/auth/rbac";
import { getPost, updatePost, deletePost } from "@/modules/blog/blog.service";

type Params = { params: Promise<{ id: string }> };

export const GET = (_req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const { id } = await params;
    await requireCapability("blog.draft");
    const post = await getPost(id);
    if (!post) throw new ApiAuthError(404, "NOT_FOUND", "Post not found");
    return post;
  });

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  excerpt: z.string().nullish(),
  content: z.unknown().optional(),
  coverImageId: z.string().nullish(),
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
  scheduledFor: z.string().nullish(),
});

export const PATCH = (req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const { id } = await params;
    const user = await requireCapability("blog.draft");
    const body = updateSchema.parse(await req.json());
    return updatePost(user.id, id, body);
  });

export const DELETE = (_req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const { id } = await params;
    const user = await requireCapability("blog.publish");
    await deletePost(user.id, id);
    return { deleted: true };
  });
