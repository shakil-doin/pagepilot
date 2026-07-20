import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApi, requireCapability, ApiAuthError } from "@/modules/auth/rbac";
import { ALLOWED_MIME, MAX_UPLOAD_BYTES } from "@/modules/media/media.service";
import { makeStorageKey, presignUpload } from "@/modules/media/storage.service";
import { rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
});

export const POST = (req: NextRequest) =>
  handleApi(async () => {
    const user = await requireCapability("media.manage");
    const { ok, retryAfterSec } = rateLimit(`presign:${user.id}`, { limit: 60, windowMs: 60_000 });
    if (!ok) throw new ApiAuthError(429, "RATE_LIMITED", `Too many uploads, retry in ${retryAfterSec}s`);

    const body = bodySchema.parse(await req.json());
    if (!ALLOWED_MIME.includes(body.contentType)) {
      throw new ApiAuthError(400, "UNSUPPORTED_TYPE", `Content type not allowed: ${body.contentType}`);
    }
    if (body.sizeBytes > MAX_UPLOAD_BYTES) {
      throw new ApiAuthError(400, "TOO_LARGE", `File exceeds the ${MAX_UPLOAD_BYTES} byte limit`);
    }
    return presignUpload(makeStorageKey(body.filename), body.contentType);
  });
