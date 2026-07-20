import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Container from "@/components/site/container";
import SiteHeader from "@/components/site/site-header";
import SiteFooter from "@/components/site/site-footer";
import RichHtml from "@/components/site/rich-html";
import { getPublishedPostCached, listPublishedSlugs, tiptapToHtml } from "@/modules/blog/blog.service";
import { getSettingCached, DEFAULT_SEO, type SeoDefaults } from "@/modules/settings/settings.service";
import { APP } from "@/config/app.config";
import { formatDate } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export const generateStaticParams = async () => {
  const posts = await listPublishedSlugs();
  return posts.map((post) => ({ slug: post.slug }));
};

export const generateMetadata = async ({ params }: { params: Params }): Promise<Metadata> => {
  const { slug } = await params;
  const post = await getPublishedPostCached(slug);
  if (!post) return {};
  const defaults = ((await getSettingCached("seo.defaults")) as SeoDefaults | null) ?? DEFAULT_SEO;
  const base = (defaults.canonicalBaseUrl || APP.url).replace(/\/$/, "");

  const title = post.seo?.metaTitle || post.title;
  const description = post.seo?.metaDescription || post.excerpt || undefined;
  const ogImage = post.seo?.ogImage?.url || post.coverImage?.url || defaults.defaultOgImageUrl;

  return {
    title: defaults.titleTemplate ? defaults.titleTemplate.replace("%s", title) : title,
    description,
    alternates: { canonical: post.seo?.canonicalUrl || `${base}/blog/${slug}` },
    robots: post.seo?.robots || undefined,
    openGraph: {
      title: post.seo?.ogTitle || title,
      description: post.seo?.ogDescription || description,
      type: "article",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: { card: "summary_large_image" },
  };
};

const BlogPost = async ({ params }: { params: Params }) => {
  const { slug } = await params;
  const post = await getPublishedPostCached(slug);
  if (!post) notFound();

  // contentHtml is pre-rendered at publish; fall back for legacy rows
  const html = post.contentHtml ?? tiptapToHtml(post.content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    // Cached reads (unstable_cache) JSON-serialize Dates to strings, so
    // re-wrap before formatting.
    datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
    dateModified: new Date(post.updatedAt).toISOString(),
    author: { "@type": "Person", name: post.author.name },
    image: post.coverImage?.url,
    description: post.excerpt ?? undefined,
  };

  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-14 md:py-20">
        <Container className="max-w-3xl">
          <header className="mb-10">
            <h1 className="pp-heading leading-tight" style={{ fontSize: "var(--pp-text-h1)" }}>
              {post.title}
            </h1>
            <p className="pp-muted mt-4 text-sm">
              By {post.author.name} · {formatDate(post.publishedAt)}
              {post.readingMins ? ` · ${post.readingMins} min read` : ""}
            </p>
            {post.categories.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {post.categories.map((category) => (
                  <span
                    key={category.id}
                    className="rounded-full px-3 py-1 text-xs font-medium"
                    style={{ background: "var(--pp-c-surface)", color: "var(--pp-c-primary)" }}
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            ) : null}
          </header>
          {post.coverImage?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage.url}
              alt={post.coverImage.alt ?? post.title}
              className="mb-10 w-full rounded-[var(--pp-radius-xl)]"
            />
          ) : null}
          <RichHtml html={html} />
        </Container>
      </main>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
};

export default BlogPost;
