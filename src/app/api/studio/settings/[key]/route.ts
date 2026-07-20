import { NextRequest } from "next/server";
import { handleApi, requireSession, requireCapability, ApiAuthError } from "@/modules/auth/rbac";
import { SETTING_KEYS, getSetting, setSetting, type SettingKey } from "@/modules/settings/settings.service";

type Params = { params: Promise<{ key: string }> };

const parseKey = (key: string): SettingKey => {
  if (!(SETTING_KEYS as readonly string[]).includes(key)) {
    throw new ApiAuthError(400, "INVALID_KEY", `Unknown setting key: ${key}`);
  }
  return key as SettingKey;
};

export const GET = (_req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const key = parseKey((await params).key);
    // Site identity is needed by every Studio screen, not just settings admins
    if (key === "site.general") await requireSession();
    else await requireCapability("settings.manage");
    return getSetting(key, null);
  });

const SCRIPT_FIELD_MAX = 20_000;

export const PUT = (req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const key = parseKey((await params).key);
    const user = await requireCapability("settings.manage");
    const value: unknown = await req.json();

    if (key === "scripts" && value && typeof value === "object") {
      for (const [field, fieldValue] of Object.entries(value as Record<string, unknown>)) {
        if (typeof fieldValue === "string" && fieldValue.length > SCRIPT_FIELD_MAX) {
          throw new ApiAuthError(400, "TOO_LARGE", `Field "${field}" exceeds ${SCRIPT_FIELD_MAX} characters`);
        }
      }
    }

    await setSetting(user.id, key, value);
    return { ok: true };
  });
