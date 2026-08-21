import "server-only";
import { db } from "@/lib/db";
import { cached, withFallback, TAGS, expireTag } from "@/lib/cache";
import { audit } from "@/modules/auth/audit.service";
import { sanitizeRichText } from "@/lib/sanitize";
import { slugify } from "@/lib/utils";
import type { PostStatus } from "@/generated/prisma/enums";

const POSTS_PER_PAGE = 12;

// ── Public reads (cached, static-friendly) ───────────────────────────────────

const latestPostsCached = cached(
  async (count: number) => {
    const posts = await db.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: count,
      select: {
        slug: true,
        title: true,
        excerpt: true,
        publishedAt: true,
        coverImage: { select: { url: true } },
      },
    });
    return posts.map((post) => ({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      publishedAt: post.publishedAt,
      coverUrl: post.coverImage?.url ?? null,
    }));
  },
  ["latest-posts"],
  [TAGS.blogIndex],
);

// Reachable from any page via the blog-latest widget: an empty list beats a crash.
export const listLatestPostsCached = (count: number) =>
  withFallback(`latest-posts:${count}`, () => latestPostsCached(count), []);

const publishedPostsCached = cached(
  async (page: number) => {
    const [posts, total] = await Promise.all([
      db.post.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * POSTS_PER_PAGE,
        take: POSTS_PER_PAGE,
        select: {
          slug: true,
          title: true,
          excerpt: true,
          publishedAt: true,
          readingMins: true,
          author: { select: { name: true, image: true } },
          coverImage: { select: { url: true, alt: true, blurDataUrl: true, width: true, height: true } },
          categories: { select: { slug: true, name: true } },
        },
      }),
      db.post.count({ where: { status: "PUBLISHED" } }),
    ]);
    return { posts, total, pages: Math.max(1, Math.ceil(total / POSTS_PER_PAGE)) };
  },
  ["published-posts"],
  [TAGS.blogIndex],
);

// Primary content of the blog index — not wrapped: a DB error must surface as a
// retryable error, not a fake "no posts" page. (See note in page.service.ts.)
export const listPublishedPostsCached = publishedPostsCached;

// Primary content of a post page — null means "no such post" → 404. A DB error
// must propagate rather than masquerade as a 404, so this stays unwrapped too.
export const getPublishedPostCached = cached(
  async (slug: string) => {
    return db.post.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: {
        author: { select: { name: true, image: true } },
        coverImage: true,
        categories: true,
        tags: true,
        seo: { include: { ogImage: { select: { url: true } } } },
      },
    });
  },
  ["published-post"],
  [TAGS.blogIndex],
);

export const listPublishedSlugs = () =>
  withFallback("published-slugs", () =>
    db.post.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true, seo: { select: { excludeFromSitemap: true } } } }),
    [],
  );

// ── TipTap JSON → HTML (pre-rendered at publish) ─────────────────────────────

type TipTapNode = {
  type?: string;
  text?: string;
  content?: TipTapNode[];
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
};

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const renderMarks = (text: string, marks: TipTapNode["marks"] = []): string => {
  let html = escapeHtml(text);
  for (const mark of marks) {
    if (mark.type === "bold") html = `<strong>${html}</strong>`;
    else if (mark.type === "italic") html = `<em>${html}</em>`;
    else if (mark.type === "underline") html = `<u>${html}</u>`;
    else if (mark.type === "strike") html = `<s>${html}</s>`;
    else if (mark.type === "code") html = `<code>${html}</code>`;
    else if (mark.type === "link") {
      const href = escapeHtml(String(mark.attrs?.href ?? "#"));
      html = `<a href="${href}" rel="noopener noreferrer">${html}</a>`;
    }
  }
  return html;
};

const renderNode = (node: TipTapNode): string => {
  if (node.type === "text") return renderMarks(node.text ?? "", node.marks);
  const children = (node.content ?? []).map(renderNode).join("");
  switch (node.type) {
    case "doc":
      return children;
    case "paragraph":
      return `<p>${children || "<br>"}</p>`;
    case "heading": {
      const level = Math.min(Math.max(Number(node.attrs?.level ?? 2), 1), 6);
      return `<h${level}>${children}</h${level}>`;
    }
    case "bulletList":
      return `<ul>${children}</ul>`;
    case "orderedList":
      return `<ol>${children}</ol>`;
    case "listItem":
      return `<li>${children}</li>`;
    case "blockquote":
      return `<blockquote>${children}</blockquote>`;
    case "codeBlock":
      return `<pre><code>${children}</code></pre>`;
    case "horizontalRule":
      return "<hr>";
    case "hardBreak":
      return "<br>";
    case "image": {
      const src = escapeHtml(String(node.attrs?.src ?? ""));
      const alt = escapeHtml(String(node.attrs?.alt ?? ""));
      return src ? `<figure><img src="${src}" alt="${alt}" loading="lazy"></figure>` : "";
    }
    default:
      return children;
  }
};

export const tiptapToHtml = (doc: unknown): string => {
  if (!doc || typeof doc !== "object") return "";
  return sanitizeRichText(renderNode(doc as TipTapNode));
};

const wordCount = (doc: unknown): number => {
  const walk = (node: TipTapNode): number => {
    const own = node.text ? node.text.split(/\s+/).filter(Boolean).length : 0;
    return own + (node.content ?? []).reduce((sum, child) => sum + walk(child), 0);
  };
  return doc && typeof doc === "object" ? walk(doc as TipTapNode) : 0;
};

// ── Studio CRUD ──────────────────────────────────────────────────────────────

export const listPosts = async (params: { query?: string; status?: PostStatus; page?: number }) => {
  const page = params.page ?? 1;
  const where = {
    ...(params.status ? { status: params.status } : {}),
    ...(params.query
      ? { OR: [{ title: { contains: params.query, mode: "insensitive" as const } }, { slug: { contains: params.query } }] }
      : {}),
  };
  const [posts, total] = await Promise.all([
    db.post.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * 20,
      take: 20,
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        publishedAt: true,
        scheduledFor: true,
        updatedAt: true,
        author: { select: { id: true, name: true } },
        categories: { select: { id: true, name: true } },
      },
    }),
    db.post.count({ where }),
  ]);
  return { posts, total, pages: Math.max(1, Math.ceil(total / 20)) };
};

export const getPost = (id: string) =>
  db.post.findUnique({
    include: {
      author: { select: { id: true, name: true } },
      coverImage: true,
      categories: true,
      tags: true,
      seo: { include: { ogImage: true } },
    },
    where: { id },
  });

export const createPost = async (userId: string, data: { title: string; slug?: string }) => {
  const base = slugify(data.slug || data.title) || "untitled";
  let slug = base;
  for (let i = 2; await db.post.findUnique({ where: { slug } }); i++) slug = `${base}-${i}`;
  const post = await db.post.create({
    data: {
      title: data.title,
      slug,
      content: { type: "doc", content: [{ type: "paragraph" }] },
      authorId: userId,
    },
  });
  await audit(userId, "post.create", `Post:${post.id}`, { title: data.title });
  return post;
};

export type PostUpdateInput = Partial<{
  title: string;
  slug: string;
  excerpt: string | null;
  content: unknown;
  coverImageId: string | null;
  categoryIds: string[];
  tagIds: string[];
  scheduledFor: string | null;
}>;

export const updatePost = async (userId: string, id: string, data: PostUpdateInput) => {
  // A slug of only symbols slugifies to "" which would make the post
  // unreachable; ignore the change rather than blank it out.
  const nextSlug = data.slug ? slugify(data.slug) || undefined : undefined;
  const post = await db.post.update({
    where: { id },
    data: {
      title: data.title,
      slug: nextSlug,
      excerpt: data.excerpt,
      content: data.content as object | undefined,
      coverImageId: data.coverImageId,
      scheduledFor: data.scheduledFor === undefined ? undefined : data.scheduledFor ? new Date(data.scheduledFor) : null,
      categories: data.categoryIds ? { set: data.categoryIds.map((id) => ({ id })) } : undefined,
      tags: data.tagIds ? { set: data.tagIds.map((id) => ({ id })) } : undefined,
    },
  });
  if (post.status === "PUBLISHED") {
    // Content edits to a live post re-render its static page
    await publishPost(userId, id, { silent: true });
  }
  await audit(userId, "post.update", `Post:${id}`);
  return post;
};

export const publishPost = async (userId: string, id: string, options: { silent?: boolean } = {}) => {
  const post = await db.post.findUnique({ where: { id } });
  if (!post) throw new Error("Post not found");
  const contentHtml = tiptapToHtml(post.content);
  const readingMins = Math.max(1, Math.round(wordCount(post.content) / 200));
  const updated = await db.post.update({
    where: { id },
    data: {
      status: "PUBLISHED",
      publishedAt: post.publishedAt ?? new Date(),
      scheduledFor: null,
      contentHtml,
      readingMins,
    },
  });
  expireTag(TAGS.blogIndex, TAGS.post(updated.slug), TAGS.pages);
  if (!options.silent) await audit(userId, "post.publish", `Post:${id}`, { slug: updated.slug });
  return updated;
};

export const schedulePost = async (userId: string, id: string, when: Date) => {
  const post = await db.post.update({ where: { id }, data: { status: "SCHEDULED", scheduledFor: when } });
  await audit(userId, "post.schedule", `Post:${id}`, { scheduledFor: when.toISOString() });
  return post;
};

export const unpublishPost = async (userId: string, id: string, archive = false) => {
  const post = await db.post.update({ where: { id }, data: { status: archive ? "ARCHIVED" : "DRAFT" } });
  expireTag(TAGS.blogIndex, TAGS.post(post.slug), TAGS.pages);
  await audit(userId, archive ? "post.archive" : "post.unpublish", `Post:${id}`);
  return post;
};

export const deletePost = async (userId: string, id: string) => {
  const post = await db.post.delete({ where: { id } });
  expireTag(TAGS.blogIndex, TAGS.post(post.slug));
  await audit(userId, "post.delete", `Post:${id}`, { title: post.title });
};

// Cron entry point: flips due SCHEDULED posts to PUBLISHED.
export const publishDueScheduledPosts = async (): Promise<number> => {
  const due = await db.post.findMany({
    where: { status: "SCHEDULED", scheduledFor: { lte: new Date() } },
    select: { id: true },
  });
  for (const post of due) await publishPost(null as unknown as string, post.id, { silent: true });
  if (due.length > 0) await audit(null, "post.publish.scheduled", `Posts:${due.length}`);
  return due.length;
};
