import type { MetadataRoute } from "next";
import { getSettingCached, DEFAULT_SEO, type SeoDefaults } from "@/modules/settings/settings.service";
import { APP } from "@/config/app.config";

const robots = async (): Promise<MetadataRoute.Robots> => {
  const defaults = ((await getSettingCached("seo.defaults")) as SeoDefaults | null) ?? DEFAULT_SEO;
  const base = (defaults.canonicalBaseUrl || APP.url).replace(/\/$/, "");

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/studio", "/api"] }],
    sitemap: `${base}/sitemap.xml`,
  };
};

export default robots;
