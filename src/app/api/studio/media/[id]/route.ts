import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApi, requireCapability, ApiAuthError } from "@/modules/auth/rbac";
import { findMediaUsage, updateMedia, trashMedia, purgeMedia } from "@/modules/media/media.service";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export const GET = (_req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const { id } = await params;
    await requireCapability("media.manage");
    const media = await db.media.findUnique({ where: { id } });
    if (!media) throw new ApiAuthError(404, "NOT_FOUND", "Media not found");
    const usage = await findMediaUsage(id);
    return { media, usage };
  });

const patchSchema = z.object({
  filename: z.string().min(1).optional(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  focalX: z.number().optional(),
  focalY: z.number().optional(),
  folderId: z.string().nullable().optional(),
});

export const PATCH = (req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const { id } = await params;
    const user = await requireCapability("media.manage");
    const body = patchSchema.parse(await req.json());
    return updateMedia(user.id, id, body);
  });

export const DELETE = (req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const { id } = await params;
    const user = await requireCapability("media.manage");
    if (req.nextUrl.searchParams.get("purge") === "1") {
      const purged = await purgeMedia(user.id, [id]);
      return { purged };
    }
    await trashMedia(user.id, [id]);
    return { trashed: true };
  });
