import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/site/container";
import SiteHeader from "@/components/site/site-header";
import SiteFooter from "@/components/site/site-footer";
import { listPublishedPostsCached } from "@/modules/blog/blog.service";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Blog" };

type SearchParams = Promise<{ page?: string }>;

const BlogIndex = async ({ searchParams }: { searchParams: SearchParams }) => {
  const { page: pageParam } = await searchParams;
  const pageNum = Math.max(1, Number(pageParam) || 1);
  const { posts, pages } = await listPublishedPostsCached(pageNum);

  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-14 md:py-20">
        <Container>
          <h1 className="pp-heading mb-10" style={{ fontSize: "var(--pp-text-h1)" }}>
            Blog
          </h1>
          {posts.length === 0 ? (
            <p className="pp-muted">No posts yet. Check back soon.</p>
          ) : (
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article key={post.slug}>
                  <Link href={`/blog/${post.slug}`} className="group block">
                    {post.coverImage?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.coverImage.url}
                        alt={post.coverImage.alt ?? post.title}
                        className="mb-4 aspect-[16/9] w-full rounded-[var(--pp-radius-lg)] object-cover"
                        loading="lazy"
                      />
                    ) : null}
                    <h2 className="pp-heading text-xl font-semibold group-hover:underline">{post.title}</h2>
                  </Link>
                  {post.excerpt ? <p className="pp-muted mt-2 line-clamp-3">{post.excerpt}</p> : null}
                  <p className="pp-muted mt-3 text-sm">
                    {formatDate(post.publishedAt)}
                    {post.readingMins ? ` · ${post.readingMins} min read` : ""}
                  </p>
                </article>
              ))}
            </div>
          )}
          {pages > 1 ? (
            <nav className="mt-12 flex justify-center gap-2" aria-label="Pagination">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={n === 1 ? "/blog" : `/blog?page=${n}`}
                  className="rounded px-3 py-1.5 text-sm"
                  style={{
                    background: n === pageNum ? "var(--pp-c-primary)" : "var(--pp-c-surface)",
                    color: n === pageNum ? "#fff" : "var(--pp-c-text)",
                  }}
                >
                  {n}
                </Link>
              ))}
            </nav>
          ) : null}
        </Container>
      </main>
      <SiteFooter />
    </>
  );
};

export default BlogIndex;
