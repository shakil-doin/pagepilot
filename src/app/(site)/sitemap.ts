import type { MetadataRoute } from "next";
import { listPublishedPathsCached } from "@/modules/pages/page.service";
import { listPublishedSlugs } from "@/modules/blog/blog.service";
import { getSettingCached, DEFAULT_SEO, type SeoDefaults } from "@/modules/settings/settings.service";
import { APP } from "@/config/app.config";

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const defaults =
    ((await getSettingCached("seo.defaults").catch(() => null)) as SeoDefaults | null) ?? DEFAULT_SEO;
  const base = (defaults.canonicalBaseUrl || APP.url).replace(/\/$/, "");

  let pages: Awaited<ReturnType<typeof listPublishedPathsCached>> = [];
  let posts: Awaited<ReturnType<typeof listPublishedSlugs>> = [];
  try {
    [pages, posts] = await Promise.all([listPublishedPathsCached(), listPublishedSlugs()]);
  } catch {}

  const pageEntries = pages
    .filter((page) => !page.seo?.excludeFromSitemap)
    .map((page) => ({
      url: `${base}${page.path === "/" ? "" : page.path}`,
      lastModified: page.updatedAt,
      priority: page.seo?.sitemapPriority ?? undefined,
      changeFrequency: (page.seo?.sitemapChangeFreq as "daily" | "weekly" | "monthly" | undefined) ?? undefined,
    }));

  const postEntries = posts
    .filter((post) => !post.seo?.excludeFromSitemap)
    .map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: post.updatedAt,
    }));

  return [...pageEntries, { url: `${base}/blog`, changeFrequency: "daily" as const }, ...postEntries];
};

export default sitemap;
