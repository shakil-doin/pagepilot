import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import { renderSections } from "@/components/site/section-renderer";
import SiteHeader from "@/components/site/site-header";
import SiteFooter from "@/components/site/site-footer";
import { getPublishedPage, listPublishedPathsCached } from "@/modules/pages/page.service";
import { getSettingCached, DEFAULT_SEO, type SeoDefaults } from "@/modules/settings/settings.service";
import { db } from "@/lib/db";
import { APP } from "@/config/app.config";
import type { SectionNode } from "@/types";

type Params = { slug?: string[] };

const pathFromSlug = (slug?: string[]) => (slug && slug.length > 0 ? `/${slug.join("/")}` : "/");

export const generateStaticParams = async (): Promise<Params[]> => {
  const pages = await listPublishedPathsCached();
  return pages.map((page) => ({ slug: page.path === "/" ? [] : page.path.slice(1).split("/") }));
};

// Draft mode is the only dynamic path: the builder iframe and Studio previews
// read the rolling draft revision; production visitors always hit statics.
const loadPage = async (slug?: string[]) => {
  const path = pathFromSlug(slug);
  const { isEnabled } = await draftMode();

  if (isEnabled) {
    const page = await db.page.findUnique({ where: { path }, include: { seo: true } });
    if (!page) return null;
    const draft = await db.pageRevision.findFirst({ where: { pageId: page.id }, orderBy: { version: "desc" } });
    return {
      page: {
        title: page.title,
        hideHeader: page.hideHeader,
        hideFooter: page.hideFooter,
        seo: page.seo,
        sections: (draft?.sections as SectionNode[]) ?? [],
      },
      preview: true,
    };
  }

  const page = await getPublishedPage(path);
  return page ? { page, preview: false } : null;
};

export const generateMetadata = async ({ params }: { params: Promise<Params> }): Promise<Metadata> => {
  const { slug } = await params;
  const loaded = await loadPage(slug);
  if (!loaded) return {};
  const defaults = ((await getSettingCached("seo.defaults")) as SeoDefaults | null) ?? DEFAULT_SEO;
  const seo = loaded.page.seo;
  const path = pathFromSlug(slug);
  const base = defaults.canonicalBaseUrl || APP.url;

  const title = seo?.metaTitle || loaded.page.title;
  const description = seo?.metaDescription || defaults.defaultDescription || undefined;
  const ogImageUrl =
    (seo && "ogImage" in seo ? (seo.ogImage as { url: string } | null)?.url : undefined) ||
    defaults.defaultOgImageUrl ||
    undefined;

  return {
    title: defaults.titleTemplate ? defaults.titleTemplate.replace("%s", title) : title,
    description,
    alternates: { canonical: seo?.canonicalUrl || `${base}${path === "/" ? "" : path}` },
    robots: seo?.robots || undefined,
    openGraph: {
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      type: (seo?.ogType as "website" | "article") || "website",
      images: ogImageUrl ? [{ url: ogImageUrl }] : undefined,
    },
    twitter: {
      card: (seo?.twitterCard as "summary" | "summary_large_image") || "summary_large_image",
    },
  };
};

const SitePage = async ({ params }: { params: Promise<Params> }) => {
  const { slug } = await params;
  const loaded = await loadPage(slug);
  if (!loaded) notFound();

  const { page, preview } = loaded;
  const structuredData = page.seo?.structuredData;

  return (
    <>
      {!page.hideHeader ? <SiteHeader /> : null}
      <main className="flex-1">{await renderSections(page.sections, { preview })}</main>
      {!page.hideFooter ? <SiteFooter /> : null}
      {structuredData ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      ) : null}
      {preview ? (
        // Keeps scroll position across the soft reloads the builder triggers
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var y=sessionStorage.getItem('pp-scroll');if(y)window.scrollTo(0,parseInt(y,10));window.addEventListener('scroll',function(){sessionStorage.setItem('pp-scroll',String(window.scrollY))},{passive:true});}catch(e){}`,
          }}
        />
      ) : null}
    </>
  );
};

export default SitePage;
