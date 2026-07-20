import { listPublishedPostsCached } from "@/modules/blog/blog.service";
import { getSettingCached, DEFAULT_GENERAL, DEFAULT_SEO, type GeneralSettings, type SeoDefaults } from "@/modules/settings/settings.service";
import { APP } from "@/config/app.config";

const escapeXml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const GET = async () => {
  const [{ posts }, general, seo] = await Promise.all([
    listPublishedPostsCached(1),
    getSettingCached("site.general") as Promise<GeneralSettings | null>,
    getSettingCached("seo.defaults") as Promise<SeoDefaults | null>,
  ]);
  const settings = general ?? DEFAULT_GENERAL;
  const base = ((seo ?? DEFAULT_SEO).canonicalBaseUrl || APP.url).replace(/\/$/, "");

  const items = posts
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${base}/blog/${post.slug}</link>
      <guid>${base}/blog/${post.slug}</guid>
      ${post.publishedAt ? `<pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>` : ""}
      ${post.excerpt ? `<description>${escapeXml(post.excerpt)}</description>` : ""}
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(settings.siteName)} Blog</title>
    <link>${base}/blog</link>
    <description>${escapeXml(settings.tagline ?? "")}</description>
${items}
  </channel>
</rss>`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
};
