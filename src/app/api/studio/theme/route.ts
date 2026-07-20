import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApi, requireSession, requireCapability } from "@/modules/auth/rbac";
import { listThemes, createTheme, DEFAULT_TOKENS } from "@/modules/theme/theme.service";
import type { ThemeTokens } from "@/types";

export const GET = () =>
  handleApi(async () => {
    await requireSession();
    return { themes: await listThemes(), defaultTokens: DEFAULT_TOKENS };
  });

const createSchema = z.object({
  name: z.string().min(1),
  tokens: z.record(z.string(), z.unknown()),
  activate: z.boolean().optional(),
});

export const POST = (req: NextRequest) =>
  handleApi(async () => {
    const user = await requireCapability("theme.manage");
    const body = createSchema.parse(await req.json());
    return createTheme(user.id, body.name, body.tokens as unknown as ThemeTokens, body.activate ?? false);
  });
