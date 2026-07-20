import "server-only";
import { db } from "@/lib/db";
import { cached, TAGS, expireTag } from "@/lib/cache";
import { audit } from "@/modules/auth/audit.service";
import { normalizePath } from "@/lib/utils";
import type { SeoInput } from "@/types";

export const upsertSeo = async (
  userId: string,
  target: { pageId?: string; postId?: string },
  input: SeoInput,
) => {
  const data = {
    metaTitle: input.metaTitle,
    metaDescription: input.metaDescription,
    canonicalUrl: input.canonicalUrl,
    robots: input.robots,
    ogTitle: input.ogTitle,
    ogDescription: input.ogDescription,
    ogImageId: input.ogImageId,
    ogType: input.ogType,
    twitterCard: input.twitterCard,
    structuredData: input.structuredData as object | undefined,
    excludeFromSitemap: input.excludeFromSitemap,
    sitemapPriority: input.sitemapPriority,
    sitemapChangeFreq: input.sitemapChangeFreq,
  };

  const where = target.pageId ? { pageId: target.pageId } : { postId: target.postId };
  const seo = await db.seo.upsert({
    where: where as { pageId: string } | { postId: string },
    create: { ...data, ...target },
    update: data,
  });

  if (target.pageId) {
    const page = await db.page.findUnique({ where: { id: target.pageId }, select: { path: true } });
    if (page) expireTag(TAGS.page(page.path), TAGS.pages);
  }
  if (target.postId) {
    const post = await db.post.findUnique({ where: { id: target.postId }, select: { slug: true } });
    if (post) expireTag(TAGS.post(post.slug), TAGS.blogIndex);
  }
  await audit(userId, "seo.update", target.pageId ? `Page:${target.pageId}` : `Post:${target.postId}`);
  return seo;
};

// ── Redirects ────────────────────────────────────────────────────────────────

export const getRedirectMapCached = cached(
  async () => {
    const redirects = await db.redirect.findMany();
    return Object.fromEntries(redirects.map((r) => [r.fromPath, { to: r.toPath, permanent: r.permanent }]));
  },
  ["redirect-map"],
  [TAGS.redirects],
);

export const listRedirects = () => db.redirect.findMany({ orderBy: { createdAt: "desc" } });

const detectLoop = async (fromPath: string, toPath: string): Promise<boolean> => {
  const map = Object.fromEntries((await db.redirect.findMany()).map((r) => [r.fromPath, r.toPath]));
  map[fromPath] = toPath;
  let cursor = toPath;
  for (let hops = 0; hops < 10; hops++) {
    if (cursor === fromPath) return true;
    const next = map[cursor];
    if (!next) return false;
    cursor = next;
  }
  return true; // too many hops behaves like a loop
};

export const createRedirect = async (
  userId: string,
  data: { fromPath: string; toPath: string; permanent?: boolean },
) => {
  const fromPath = normalizePath(data.fromPath);
  const toPath = data.toPath.startsWith("http") ? data.toPath : normalizePath(data.toPath);
  if (fromPath === toPath) throw new Error("A redirect cannot point to itself");
  if (!toPath.startsWith("http") && (await detectLoop(fromPath, toPath))) {
    throw new Error("This redirect would create a loop");
  }
  const redirect = await db.redirect.upsert({
    where: { fromPath },
    create: { fromPath, toPath, permanent: data.permanent ?? true },
    update: { toPath, permanent: data.permanent ?? true },
  });
  expireTag(TAGS.redirects);
  await audit(userId, "redirect.create", `Redirect:${fromPath}`, { toPath });
  return redirect;
};

export const deleteRedirect = async (userId: string, id: string) => {
  const redirect = await db.redirect.delete({ where: { id } });
  expireTag(TAGS.redirects);
  await audit(userId, "redirect.delete", `Redirect:${redirect.fromPath}`);
};

export const importRedirectsCsv = async (userId: string, csv: string) => {
  const lines = csv.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  let imported = 0;
  const errors: string[] = [];
  for (const line of lines) {
    const [from, to, flag] = line.split(",").map((cell) => cell.trim());
    if (!from || !to || from.toLowerCase() === "from") continue;
    try {
      await createRedirect(userId, { fromPath: from, toPath: to, permanent: flag !== "307" });
      imported++;
    } catch (err) {
      errors.push(`${from}: ${err instanceof Error ? err.message : "failed"}`);
    }
  }
  return { imported, errors };
};
