import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApi, requireCapability, ApiAuthError } from "@/modules/auth/rbac";
import { updateTheme, deleteTheme } from "@/modules/theme/theme.service";
import type { ThemeTokens } from "@/types";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  tokens: z.record(z.string(), z.unknown()).optional(),
});

export const PATCH = (req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const { id } = await params;
    const user = await requireCapability("theme.manage");
    const body = patchSchema.parse(await req.json());
    return updateTheme(user.id, id, {
      name: body.name,
      tokens: body.tokens as unknown as ThemeTokens | undefined,
    });
  });

export const DELETE = (_req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const { id } = await params;
    const user = await requireCapability("theme.manage");
    try {
      await deleteTheme(user.id, id);
    } catch (err) {
      throw new ApiAuthError(409, "ACTIVE_THEME", err instanceof Error ? err.message : "Theme is active");
    }
    return { deleted: true };
  });
