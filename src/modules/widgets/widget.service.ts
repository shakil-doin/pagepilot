import "server-only";
import { db } from "@/lib/db";
import { cached, withFallback, TAGS, expireTag } from "@/lib/cache";
import { audit } from "@/modules/auth/audit.service";
import type { SectionNode } from "@/types";

// ── Global widgets: one instance referenced from many pages ─────────────────

const globalWidgetCached = cached(
  async (id: string) => {
    const widget = await db.globalWidget.findUnique({ where: { id } });
    return widget ? { id: widget.id, type: widget.type, props: widget.props as Record<string, unknown> } : null;
  },
  ["global-widget"],
  // A per-id tag is added at call sites via page tags; the shared tag keeps it simple
  ["global-widgets"],
);

// Rendered inline in any page section: a DB failure renders nothing, not a crash.
export const getGlobalWidgetCached = (id: string) =>
  withFallback(`global-widget:${id}`, () => globalWidgetCached(id), null);

export const listGlobalWidgets = () => db.globalWidget.findMany({ orderBy: { updatedAt: "desc" } });

// Full row (incl. name) for the Studio edit sheet; the cached variant strips
// to the render shape and must not be used where the name is edited.
export const getGlobalWidget = (id: string) => db.globalWidget.findUnique({ where: { id } });

// Pages whose published revision references this global widget; they must
// revalidate when the widget changes.
export const findPagesUsingGlobal = async (globalId: string): Promise<{ id: string; path: string; title: string }[]> => {
  const pages = await db.page.findMany({
    where: { publishedRevisionId: { not: null } },
    select: { id: true, path: true, title: true, publishedRevision: { select: { sections: true } } },
  });
  const uses = (sections: unknown): boolean => {
    const walk = (nodes: SectionNode[]): boolean =>
      nodes.some(
        (node) =>
          (node.type === "global" && node.globalId === globalId) ||
          (node.children ?? []).some((slot) => walk(slot)),
      );
    return Array.isArray(sections) && walk(sections as SectionNode[]);
  };
  return pages.filter((page) => uses(page.publishedRevision?.sections)).map(({ id, path, title }) => ({ id, path, title }));
};

export const createGlobalWidget = async (userId: string, data: { name: string; type: string; props: Record<string, unknown> }) => {
  const widget = await db.globalWidget.create({ data: { ...data, props: data.props as object } });
  await audit(userId, "widget.global.create", `GlobalWidget:${widget.id}`, { name: data.name });
  return widget;
};

export const updateGlobalWidget = async (
  userId: string,
  id: string,
  data: { name?: string; props?: Record<string, unknown> },
) => {
  const widget = await db.globalWidget.update({
    where: { id },
    data: { name: data.name, props: data.props as object | undefined },
  });
  const affected = await findPagesUsingGlobal(id);
  expireTag("global-widgets", TAGS.globalWidget(id), ...affected.map((page) => TAGS.page(page.path)));
  await audit(userId, "widget.global.update", `GlobalWidget:${id}`, { affectedPages: affected.length });
  return { widget, affected };
};

export const deleteGlobalWidget = async (userId: string, id: string) => {
  const affected = await findPagesUsingGlobal(id);
  if (affected.length > 0) {
    throw new Error(`Still used on ${affected.length} page(s): ${affected.map((p) => p.path).join(", ")}`);
  }
  await db.globalWidget.delete({ where: { id } });
  expireTag("global-widgets");
  await audit(userId, "widget.global.delete", `GlobalWidget:${id}`);
};

// ── Custom widgets: trees of primitives composed in the Studio ──────────────

const customWidgetCached = cached(
  async (id: string) => {
    const widget = await db.customWidget.findUnique({ where: { id } });
    if (!widget) return null;
    // tree and exposedProps are authored as free JSON in the composer; coerce
    // non-arrays to empty so a bad save renders nothing rather than crashing.
    return {
      id: widget.id,
      tree: Array.isArray(widget.tree) ? (widget.tree as SectionNode[]) : [],
      exposedProps: Array.isArray(widget.exposedProps)
        ? (widget.exposedProps as { key: string; label: string; type: string; target: string }[])
        : [],
    };
  },
  ["custom-widget"],
  ["custom-widgets"],
);

export const getCustomWidgetCached = (id: string) =>
  withFallback(`custom-widget:${id}`, () => customWidgetCached(id), null);

export const listCustomWidgets = () =>
  db.customWidget.findMany({
    select: { id: true, name: true, description: true, thumbnail: true, exposedProps: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

export const getCustomWidget = (id: string) => db.customWidget.findUnique({ where: { id } });

export const createCustomWidget = async (
  userId: string,
  data: { name: string; description?: string; tree: SectionNode[]; exposedProps?: unknown },
) => {
  const widget = await db.customWidget.create({
    data: {
      name: data.name,
      description: data.description,
      tree: data.tree as unknown as object,
      exposedProps: data.exposedProps as object | undefined,
    },
  });
  await audit(userId, "widget.custom.create", `CustomWidget:${widget.id}`, { name: data.name });
  return widget;
};

export const updateCustomWidget = async (
  userId: string,
  id: string,
  data: { name?: string; description?: string; tree?: SectionNode[]; exposedProps?: unknown },
) => {
  const widget = await db.customWidget.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      tree: data.tree as unknown as object | undefined,
      exposedProps: data.exposedProps as object | undefined,
    },
  });
  expireTag("custom-widgets");
  await audit(userId, "widget.custom.update", `CustomWidget:${id}`);
  return widget;
};

export const deleteCustomWidget = async (userId: string, id: string) => {
  await db.customWidget.delete({ where: { id } });
  expireTag("custom-widgets");
  await audit(userId, "widget.custom.delete", `CustomWidget:${id}`);
};
