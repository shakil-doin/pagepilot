import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApi, requireSession, requireCapability, ApiAuthError } from "@/modules/auth/rbac";
import { listInstalledSets, installIconSet } from "@/modules/icons/icon.service";

export const GET = () =>
  handleApi(async () => {
    await requireSession();
    return listInstalledSets();
  });

const installSchema = z.object({ prefix: z.string().min(1) });

export const POST = (req: NextRequest) =>
  handleApi(async () => {
    const user = await requireCapability("icons.install");
    const { prefix } = installSchema.parse(await req.json());
    try {
      return await installIconSet(user.id, prefix);
    } catch (err) {
      // Unknown prefix / Iconify fetch failures surface as a client error
      throw new ApiAuthError(400, "INSTALL_FAILED", err instanceof Error ? err.message : "Install failed");
    }
  });
