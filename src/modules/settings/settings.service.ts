import "server-only";
import crypto from "node:crypto";
import { db } from "@/lib/db";
import { cached, withFallback, TAGS, expireTag } from "@/lib/cache";
import { audit } from "@/modules/auth/audit.service";
import { APP } from "@/config/app.config";

// Known setting keys. Values are free-form JSON validated by their screens.
export const SETTING_KEYS = [
  "site.general",
  "site.urls",
  "seo.defaults",
  "scripts",
  "forms",
  "storage",
  "email",
  "maintenance",
] as const;
export type SettingKey = (typeof SETTING_KEYS)[number];

// Keys whose values may hold secrets; encrypted at rest with APP_SECRET.
const ENCRYPTED_KEYS: SettingKey[] = ["storage", "email"];

const keyBytes = crypto.createHash("sha256").update(APP.secret).digest();

const encrypt = (plain: string): string => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", keyBytes, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return `enc:${iv.toString("base64")}:${cipher.getAuthTag().toString("base64")}:${enc.toString("base64")}`;
};

const decrypt = (payload: string): string => {
  const [, ivB64, tagB64, dataB64] = payload.split(":");
  const decipher = crypto.createDecipheriv("aes-256-gcm", keyBytes, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]).toString("utf8");
};

const unwrap = (key: string, value: unknown): unknown => {
  if (ENCRYPTED_KEYS.includes(key as SettingKey) && typeof value === "string" && value.startsWith("enc:")) {
    return JSON.parse(decrypt(value));
  }
  return value;
};

export const getSetting = async <T = unknown>(key: SettingKey, fallback: T): Promise<T> => {
  const row = await db.setting.findUnique({ where: { key } });
  if (!row) return fallback;
  return unwrap(key, row.value) as T;
};

// Cached variant for the public site render path.
const settingCached = cached(
  async (key: string) => {
    const row = await db.setting.findUnique({ where: { key } });
    return row ? unwrap(key, row.value) : null;
  },
  ["setting"],
  [TAGS.settings],
);

// Public render-path reader: a DB failure yields null (callers already treat
// null as "use defaults") instead of crashing the page.
export const getSettingCached = (key: SettingKey): Promise<unknown> =>
  withFallback<unknown>(`setting:${key}`, () => settingCached(key), null);

export const setSetting = async (userId: string | null, key: SettingKey, value: unknown) => {
  const stored = ENCRYPTED_KEYS.includes(key) ? encrypt(JSON.stringify(value)) : (value as object);
  await db.setting.upsert({
    where: { key },
    create: { key, value: stored as object },
    update: { value: stored as object },
  });
  expireTag(TAGS.settings);
  await audit(userId, "setting.update", `Setting:${key}`);
};

export type GeneralSettings = {
  siteName: string;
  tagline?: string;
  logoLightId?: string | null;
  logoDarkId?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  language: string;
  timezone: string;
};

export const DEFAULT_GENERAL: GeneralSettings = {
  siteName: "PagePilot Site",
  tagline: "",
  language: "en",
  timezone: "UTC",
};

export type SeoDefaults = {
  titleTemplate: string;
  defaultDescription?: string;
  defaultOgImageUrl?: string;
  twitterHandle?: string;
  canonicalBaseUrl?: string;
  robotsTxt?: string;
  organizationJsonLd?: Record<string, unknown> | null;
  verification?: { google?: string; bing?: string };
};

export const DEFAULT_SEO: SeoDefaults = {
  titleTemplate: "%s | PagePilot Site",
  robotsTxt: "",
};
