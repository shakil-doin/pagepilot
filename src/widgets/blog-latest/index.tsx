import Link from "next/link";
import Section from "@/components/site/section";
import { listLatestPostsCached } from "@/modules/blog/blog.service";
import type { Props } from "./schema";

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

const BlogLatest = async ({ title, count, showExcerpt }: Props) => {
  const posts = await listLatestPostsCached(count);
  if (posts.length === 0) return null;

  return (
    <Section className="py-14 md:py-20">
      <h2 className="pp-heading mb-12 text-center" style={{ fontSize: "var(--pp-text-h2)" }}>
        {title}
      </h2>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block h-full rounded-[var(--pp-radius-lg)] border p-6 transition-transform hover:-translate-y-0.5"
            style={{ borderColor: "var(--pp-c-border)" }}
          >
            {post.coverUrl ? (
              // Cover is a raw URL without intrinsic dimensions, so next/image is not usable.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.coverUrl}
                alt=""
                loading="lazy"
                className="mb-4 h-44 w-full rounded-[var(--pp-radius-md)] object-cover"
              />
            ) : null}
            {post.publishedAt ? (
              // Cached reads serialize Dates to strings; re-wrap for Intl.
              <p className="pp-muted text-sm">{dateFormat.format(new Date(post.publishedAt))}</p>
            ) : null}
            <h3 className="pp-heading mt-1 text-lg font-semibold group-hover:underline">{post.title}</h3>
            {showExcerpt && post.excerpt ? <p className="pp-muted mt-2 leading-relaxed">{post.excerpt}</p> : null}
          </Link>
        ))}
      </div>
    </Section>
  );
};

export default BlogLatest;
