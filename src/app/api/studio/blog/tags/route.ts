import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApi, requireSession, requireCapability, ApiAuthError } from "@/modules/auth/rbac";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

export const GET = () =>
  handleApi(async () => {
    await requireSession();
    return db.tag.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { posts: true } } },
    });
  });

const createSchema = z.object({ name: z.string().min(1) });

export const POST = (req: NextRequest) =>
  handleApi(async () => {
    await requireCapability("blog.draft");
    const { name } = createSchema.parse(await req.json());
    return db.tag.create({ data: { name, slug: slugify(name) } });
  });

export const DELETE = (req: NextRequest) =>
  handleApi(async () => {
    await requireCapability("blog.publish");
    const id = req.nextUrl.searchParams.get("id");
    if (!id) throw new ApiAuthError(400, "MISSING_ID", "Query param id is required");
    await db.tag.delete({ where: { id } });
    return { deleted: true };
  });
