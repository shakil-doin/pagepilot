import { NextRequest } from "next/server";
import { handleApi, requireCapability, ApiAuthError } from "@/modules/auth/rbac";
import { ALLOWED_MIME, MAX_UPLOAD_BYTES } from "@/modules/media/media.service";
import { storeLocal } from "@/modules/media/storage.service";

// Local-dev fallback when ImageKit is not configured; presign returns this endpoint.
export const POST = (req: NextRequest) =>
  handleApi(async () => {
    await requireCapability("media.manage");
    const form = await req.formData();
    const file = form.get("file");
    const storageKey = String(form.get("storageKey") ?? "");

    if (!(file instanceof File)) throw new ApiAuthError(400, "MISSING_FILE", "file field is required");
    // storeLocal writes under public/uploads; the key must stay inside it
    if (!storageKey.startsWith("media/") || storageKey.includes("..")) {
      throw new ApiAuthError(400, "BAD_KEY", "Invalid storage key");
    }
    if (!ALLOWED_MIME.includes(file.type)) {
      throw new ApiAuthError(400, "UNSUPPORTED_TYPE", `Content type not allowed: ${file.type}`);
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new ApiAuthError(400, "TOO_LARGE", `File exceeds the ${MAX_UPLOAD_BYTES} byte limit`);
    }

    await storeLocal(storageKey, Buffer.from(await file.arrayBuffer()));
    return { ok: true };
  });
