import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApi, requireCapability } from "@/modules/auth/rbac";
import { commitMedia } from "@/modules/media/media.service";

const bodySchema = z.object({
  storageKey: z.string().min(1),
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
  folderId: z.string().nullish(),
  alt: z.string().optional(),
});

export const POST = (req: NextRequest) =>
  handleApi(async () => {
    const user = await requireCapability("media.manage");
    const body = bodySchema.parse(await req.json());
    return commitMedia(user.id, body);
  });
