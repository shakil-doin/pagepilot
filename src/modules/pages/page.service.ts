import "server-only";
import { db } from "@/lib/db";
import { cached, withFallback, TAGS, expireTag } from "@/lib/cache";
import { audit } from "@/modules/auth/audit.service";
import { normalizePath } from "@/lib/utils";
import { isAdmin } from "@/modules/auth/permissions";
import type { Role, PageStatus } from "@/generated/prisma/enums";
import type { SectionNode } from "@/types";

// ── Public reads (cached, static-friendly) ───────────────────────────────────

// NOT wrapped in withFallback on purpose: a null return means "this page does
// not exist" and the route turns it into a 404. A database error must NOT be
// squashed into null here — that would 404 a page that really exists whenever
// the DB has a transient hiccup. Let the error propagate (db.ts already retries
// transient failures) so a real outage surfaces as a retryable error, never a
// misleading 404. Chrome (theme/menu/settings) still degrades via withFallback.
export const getPublishedPage = (path: string) =>
  cached(
    async (p: string) => {
      const page = await db.page.findFirst({
        where: { path: p, status: "PUBLISHED", publishedRevisionId: { not: null } },
        include: {
          publishedRevision: { select: { sections: true } },
          seo: { include: { ogImage: { select: { url: true } } } },
        },
      });
      if (!page?.publishedRevision) return null;
      return {
        id: page.id,
        path: page.path,
        title: page.title,
        hideHeader: page.hideHeader,
        hideFooter: page.hideFooter,
        sections: page.publishedRevision.sections as SectionNode[],
        seo: page.seo,
        updatedAt: page.updatedAt,
      };
    },
    ["published-page"],
    [TAGS.page(path), TAGS.pages],
  )(path);

const publishedPathsCached = cached(
  async () => {
    const pages = await db.page.findMany({
      where: { status: "PUBLISHED", publishedRevisionId: { not: null } },
      select: { path: true, updatedAt: true, seo: { select: { excludeFromSitemap: true, sitemapPriority: true, sitemapChangeFreq: true } } },
    });
    return pages;
  },
  ["published-paths"],
  [TAGS.pages],
);

export const listPublishedPathsCached = () => withFallback("published-paths", publishedPathsCached, []);

// Draft read for the preview iframe (never cached).
export const getDraftPage = async (pageId: string) => {
  const page = await db.page.findUnique({
    where: { id: pageId },
    include: { seo: true },
  });
  if (!page) return null;
  const draft = await getDraftRevision(pageId);
  return {
    id: page.id,
    path: page.path,
    title: page.title,
    hideHeader: page.hideHeader,
    hideFooter: page.hideFooter,
    sections: (draft?.sections as SectionNode[]) ?? [],
    seo: page.seo,
  };
};

// ── Studio reads ─────────────────────────────────────────────────────────────

export const listPages = async (params: {
  query?: string;
  status?: PageStatus;
  page?: number;
  user: { id: string; role: Role };
}) => {
  const pageNum = params.page ?? 1;
  const where = {
    ...(params.status ? { status: params.status } : {}),
    ...(params.query
      ? {
          OR: [
            { title: { contains: params.query, mode: "insensitive" as const } },
            { path: { contains: params.query, mode: "insensitive" as const } },
          ],
        }
      : {}),
    // Non-admins only see pages granted to them
    ...(isAdmin(params.user.role) ? {} : { permissions: { some: { userId: params.user.id } } }),
  };
  const [pages, total] = await Promise.all([
    db.page.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (pageNum - 1) * 20,
      take: 20,
      select: {
        id: true,
        path: true,
        title: true,
        status: true,
        locked: true,
        updatedAt: true,
        publishedRevisionId: true,
        seo: { select: { robots: true } },
        _count: { select: { revisions: true } },
      },
    }),
    db.page.count({ where }),
  ]);
  // Surface a simple indexing flag so the list can offer a one-click toggle.
  const rows = pages.map(({ seo, ...page }) => ({
    ...page,
    noindex: Boolean(seo?.robots && seo.robots.toLowerCase().includes("noindex")),
  }));
  return { pages: rows, total, pages_total: Math.max(1, Math.ceil(total / 20)) };
};

export const getPageForStudio = async (id: string) => {
  const page = await db.page.findUnique({
    where: { id },
    include: {
      seo: { include: { ogImage: { select: { id: true, url: true } } } },
      publishedRevision: { select: { id: true, version: true, createdAt: true } },
      permissions: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });
  if (!page) return null;
  const draft = await getDraftRevision(id);
  return { ...page, draft };
};

// The rolling draft: the newest revision that is not the published snapshot.
// If none exists, the draft starts from the published sections (or empty).
const getDraftRevision = async (pageId: string) => {
  const page = await db.page.findUnique({
    where: { id: pageId },
    select: { publishedRevisionId: true },
  });
  const latest = await db.pageRevision.findFirst({
    where: { pageId },
    orderBy: { version: "desc" },
  });
  if (latest && latest.id !== page?.publishedRevisionId) return latest;
  return latest; // published snapshot doubles as the draft base until first edit
};

// ── Mutations ────────────────────────────────────────────────────────────────

export const createPage = async (userId: string, data: { path: string; title: string }) => {
  const path = normalizePath(data.path);
  const existing = await db.page.findUnique({ where: { path } });
  if (existing) throw new Error(`A page already exists at ${path}`);
  const page = await db.page.create({ data: { path, title: data.title } });
  await db.pageRevision.create({
    data: { pageId: page.id, sections: [], version: 1, authorId: userId, note: "Created" },
  });
  await audit(userId, "page.create", `Page:${page.id}`, { path, title: data.title });
  return page;
};

export const updatePageMeta = async (
  userId: string,
  id: string,
  data: Partial<{ title: string; path: string; hideHeader: boolean; hideFooter: boolean; locked: boolean }>,
) => {
  const before = await db.page.findUnique({ where: { id }, select: { path: true } });
  if (!before) throw new Error("Page not found");
  const nextPath = data.path ? normalizePath(data.path) : undefined;
  if (nextPath && nextPath !== before.path) {
    const clash = await db.page.findUnique({ where: { path: nextPath } });
    if (clash) throw new Error(`A page already exists at ${nextPath}`);
  }
  const page = await db.page.update({ where: { id }, data: { ...data, path: nextPath } });
  expireTag(TAGS.page(before.path), TAGS.page(page.path), TAGS.pages);
  await audit(userId, "page.update", `Page:${id}`, { from: before.path, to: page.path });
  // Caller offers to create a redirect when the path changed
  return { page, oldPath: before.path, pathChanged: nextPath !== undefined && nextPath !== before.path };
};

// Autosave target: mutate the rolling draft in place; if the latest revision
// is the published snapshot, branch a new version so the snapshot stays frozen.
export const saveDraft = async (userId: string, pageId: string, sections: SectionNode[]) => {
  const page = await db.page.findUnique({ where: { id: pageId }, select: { publishedRevisionId: true } });
  if (!page) throw new Error("Page not found");

  const latest = await db.pageRevision.findFirst({ where: { pageId }, orderBy: { version: "desc" } });

  if (latest && latest.id !== page.publishedRevisionId) {
    return db.pageRevision.update({
      where: { id: latest.id },
      data: { sections: sections as unknown as object, authorId: userId },
    });
  }
  return db.pageRevision.create({
    data: {
      pageId,
      sections: sections as unknown as object,
      version: (latest?.version ?? 0) + 1,
      authorId: userId,
    },
  });
};

export const listRevisions = (pageId: string) =>
  db.pageRevision.findMany({
    where: { pageId },
    orderBy: { version: "desc" },
    select: {
      id: true,
      version: true,
      note: true,
      createdAt: true,
      author: { select: { id: true, name: true } },
    },
  });

export const getRevision = (id: string) => db.pageRevision.findUnique({ where: { id } });

export const publishPage = async (userId: string, pageId: string, note?: string) => {
  const page = await db.page.findUnique({ where: { id: pageId }, select: { path: true, publishedRevisionId: true } });
  if (!page) throw new Error("Page not found");
  const draft = await db.pageRevision.findFirst({ where: { pageId }, orderBy: { version: "desc" } });
  if (!draft) throw new Error("Nothing to publish");

  let target = draft;
  if (draft.id === page.publishedRevisionId) {
    // Republishing an unchanged page: keep pointing at the same snapshot
    target = draft;
  }

  await db.$transaction([
    db.pageRevision.update({ where: { id: target.id }, data: { note: note ?? target.note } }),
    db.page.update({
      where: { id: pageId },
      data: { publishedRevisionId: target.id, status: "PUBLISHED" },
    }),
  ]);

  expireTag(TAGS.page(page.path), TAGS.pages);
  await audit(userId, "page.publish", `Page:${pageId}`, { path: page.path, version: target.version, note });
  return target;
};

export const rollbackPage = async (userId: string, pageId: string, revisionId: string) => {
  const revision = await db.pageRevision.findUnique({ where: { id: revisionId } });
  if (!revision || revision.pageId !== pageId) throw new Error("Revision not found");
  const page = await db.page.update({
    where: { id: pageId },
    data: { publishedRevisionId: revisionId, status: "PUBLISHED" },
  });
  expireTag(TAGS.page(page.path), TAGS.pages);
  await audit(userId, "page.rollback", `Page:${pageId}`, { toVersion: revision.version });
  return revision;
};

export const archivePage = async (userId: string, id: string) => {
  const page = await db.page.update({ where: { id }, data: { status: "ARCHIVED" } });
  expireTag(TAGS.page(page.path), TAGS.pages);
  await audit(userId, "page.archive", `Page:${id}`, { path: page.path });
  return page;
};

// Take a live page back to draft: it stops serving publicly (getPublishedPage
// filters on status PUBLISHED) but keeps its published-revision pointer so
// Publish restores it as-is. Reversible, non-destructive.
export const unpublishPage = async (userId: string, id: string) => {
  const page = await db.page.update({ where: { id }, data: { status: "DRAFT" } });
  expireTag(TAGS.page(page.path), TAGS.pages);
  await audit(userId, "page.unpublish", `Page:${id}`, { path: page.path });
  return page;
};

// Toggle search-engine indexing for a page without disturbing its other SEO
// fields. noindex also drops it from sitemap.xml (a noindexed URL shouldn't be
// advertised); re-enabling clears both back to the indexable default.
export const setPageIndexing = async (userId: string, id: string, noindex: boolean) => {
  await db.seo.upsert({
    where: { pageId: id },
    create: { pageId: id, robots: noindex ? "noindex, nofollow" : null, excludeFromSitemap: noindex },
    update: { robots: noindex ? "noindex, nofollow" : null, excludeFromSitemap: noindex },
  });
  const page = await db.page.findUnique({ where: { id }, select: { path: true } });
  if (page) expireTag(TAGS.page(page.path), TAGS.pages);
  await audit(userId, noindex ? "page.noindex" : "page.index", `Page:${id}`);
  return { noindex };
};

export const deletePage = async (userId: string, id: string) => {
  const page = await db.page.findUnique({ where: { id }, select: { path: true, title: true, publishedRevisionId: true } });
  if (!page) return;
  // The published-revision FK blocks a cascade delete of revisions
  await db.page.update({ where: { id }, data: { publishedRevisionId: null } });
  await db.page.delete({ where: { id } });
  expireTag(TAGS.page(page.path), TAGS.pages);
  await audit(userId, "page.delete", `Page:${id}`, { path: page.path, title: page.title });
};
