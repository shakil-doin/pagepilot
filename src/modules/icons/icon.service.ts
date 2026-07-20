import "server-only";
import { db } from "@/lib/db";
import { cached, TAGS, expireTag } from "@/lib/cache";
import { audit } from "@/modules/auth/audit.service";

type IconifyCollection = {
  prefix: string;
  icons: Record<string, { body: string; width?: number; height?: number }>;
  aliases?: Record<string, { parent: string }>;
  width?: number;
  height?: number;
  info?: { name?: string; total?: number };
};

const ICONIFY_API = "https://api.iconify.design";

// Iconify rejects requests without a browser-like User-Agent (403), which used
// to make chunks silently vanish through the `!ok` skip below. Send a UA and
// retry transient failures so an install captures the whole set, not a prefix.
const iconifyFetch = async (url: string, tries = 3): Promise<Response> => {
  let last: Response | null = null;
  for (let attempt = 0; attempt < tries; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": "PagePilot/1.0" } });
    if (res.ok) return res;
    last = res;
  }
  return last!;
};

export const listInstalledSets = () =>
  db.iconSet.findMany({ select: { id: true, prefix: true, name: true, installedAt: true }, orderBy: { installedAt: "asc" } });

// Downloads a full Iconify collection once, server-side; afterwards the set is
// served from Postgres only (offline-safe, no runtime third-party calls).
export const installIconSet = async (userId: string, prefix: string) => {
  const res = await iconifyFetch(`${ICONIFY_API}/collection?prefix=${encodeURIComponent(prefix)}&icons=true&chars=false`);
  if (!res.ok) throw new Error(`Iconify collection "${prefix}" not found`);
  const info = (await res.json()) as { title?: string; uncategorized?: string[]; categories?: Record<string, string[]> };

  const names = [
    ...(info.uncategorized ?? []),
    ...Object.values(info.categories ?? {}).flat(),
  ];
  if (names.length === 0) throw new Error(`Collection "${prefix}" has no icons`);

  // The icon bodies come from the JSON endpoint in chunks to stay under URL limits
  const icons: Record<string, { body: string; width?: number; height?: number }> = {};
  let width: number | undefined;
  let height: number | undefined;
  const chunkSize = 200;
  const failed: string[] = [];
  for (let i = 0; i < names.length; i += chunkSize) {
    const chunk = names.slice(i, i + chunkSize);
    const dataRes = await iconifyFetch(`${ICONIFY_API}/${prefix}.json?icons=${encodeURIComponent(chunk.join(","))}`);
    if (!dataRes.ok) {
      failed.push(...chunk);
      continue;
    }
    const data = (await dataRes.json()) as IconifyCollection;
    width = width ?? data.width;
    height = height ?? data.height;
    Object.assign(icons, data.icons);
    for (const [alias, def] of Object.entries(data.aliases ?? {})) {
      if (data.icons[def.parent]) icons[alias] = data.icons[def.parent];
    }
  }
  // A partial install is worse than a loud failure: it silently hides icons.
  if (failed.length) {
    throw new Error(`Iconify "${prefix}": ${failed.length}/${names.length} icons failed to download; not saving a partial set. Try again.`);
  }

  const collection: IconifyCollection = { prefix, icons, width, height };
  const set = await db.iconSet.upsert({
    where: { prefix },
    create: { prefix, name: info.title ?? prefix, data: collection as object },
    update: { name: info.title ?? prefix, data: collection as object },
  });
  expireTag(TAGS.icons);
  await audit(userId, "icons.install", `IconSet:${prefix}`, { icons: Object.keys(icons).length });
  return { id: set.id, prefix, name: set.name, icons: Object.keys(icons).length };
};

export const uninstallIconSet = async (userId: string, prefix: string) => {
  await db.iconSet.delete({ where: { prefix } });
  expireTag(TAGS.icons);
  await audit(userId, "icons.uninstall", `IconSet:${prefix}`);
};

const getCollection = cached(
  async (prefix: string): Promise<IconifyCollection | null> => {
    const set = await db.iconSet.findUnique({ where: { prefix } });
    return (set?.data as IconifyCollection) ?? null;
  },
  ["icon-collection"],
  [TAGS.icons],
);

// "ph:rocket-launch" → inline SVG string, resolved from the stored collection.
export const getIconSvg = async (ref: string, size = 24): Promise<string | null> => {
  const [prefix, name] = ref.split(":");
  if (!prefix || !name) return null;
  const collection = await getCollection(prefix);
  const icon = collection?.icons[name];
  if (!icon) return null;
  const w = icon.width ?? collection?.width ?? 24;
  const h = icon.height ?? collection?.height ?? 24;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${w} ${h}" fill="currentColor" aria-hidden="true">${icon.body}</svg>`;
};

// Search across installed sets for the Studio picker.
export const searchIcons = async (query: string, prefix?: string, limit = 120) => {
  const sets = await db.iconSet.findMany(
    prefix ? { where: { prefix } } : undefined,
  );
  const q = query.toLowerCase();
  const results: { ref: string; body: string; width: number; height: number }[] = [];
  for (const set of sets) {
    const data = set.data as IconifyCollection;
    for (const [name, icon] of Object.entries(data.icons)) {
      if (q && !name.includes(q)) continue;
      results.push({
        ref: `${set.prefix}:${name}`,
        body: icon.body,
        width: icon.width ?? data.width ?? 24,
        height: icon.height ?? data.height ?? 24,
      });
      if (results.length >= limit) return results;
    }
  }
  return results;
};
