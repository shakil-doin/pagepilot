import "server-only";
import sharp from "sharp";
import { db } from "@/lib/db";
import { audit } from "@/modules/auth/audit.service";
import { deleteObject, getImagekitFile, publicUrl, readRemote } from "@/modules/media/storage.service";
import type { MediaKind } from "@/generated/prisma/enums";
import type { SectionNode } from "@/types";

const kindFromMime = (mime: string): MediaKind =>
  mime.startsWith("image/") ? "IMAGE" : mime.startsWith("video/") ? "VIDEO" : "FILE";

// Media.filename is a display label, not a DB-unique key (files are addressed
// by storageKey/id). To keep the library readable, a new or renamed file whose
// name already exists in the SAME folder gets an OS-style " (2)", " (3)" … suffix
// instead of a confusing exact duplicate. Scope is per folder (non-trashed),
// like a filesystem — different folders may reuse a name.
export const uniqueFilename = async (
  desired: string,
  folderId: string | null,
  excludeId?: string,
): Promise<string> => {
  const dot = desired.lastIndexOf(".");
  const base = dot > 0 ? desired.slice(0, dot) : desired; // dot>0 so ".env"-style names keep their name
  const ext = dot > 0 ? desired.slice(dot) : "";
  const rows = await db.media.findMany({
    where: { folderId, deletedAt: null, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { filename: true },
  });
  const taken = new Set(rows.map((r) => r.filename));
  if (!taken.has(desired)) return desired;
  let n = 2; // the un-suffixed name is effectively "1"; duplicates start at (2)
  while (taken.has(`${base} (${n})${ext}`)) n++;
  return `${base} (${n})${ext}`;
};

export const ALLOWED_MIME = [
  "image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/svg+xml",
  "video/mp4", "video/webm",
  "application/pdf", "application/zip",
];
export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

// Registers an uploaded object: probe dimensions, build the LQIP placeholder.
// ImageKit uploads pass their fileId as storageKey; local uploads pass the
// generated "media/..." key.
export const commitMedia = async (
  userId: string,
  data: {
    storageKey: string;
    filename: string;
    mimeType: string;
    sizeBytes: number;
    folderId?: string | null;
    alt?: string;
  },
) => {
  const kind = kindFromMime(data.mimeType);

  // ImageKit mode: the storageKey is a fileId; resolve url/dims from the
  // ImageKit API so a forged commit body cannot register foreign URLs.
  let url = publicUrl(data.storageKey);
  let width: number | undefined;
  let height: number | undefined;
  let sizeBytes = data.sizeBytes;
  if (!data.storageKey.startsWith("media/")) {
    const remote = await getImagekitFile(data.storageKey);
    if (!remote) throw new Error("Upload not found in ImageKit");
    url = remote.url;
    width = remote.width;
    height = remote.height;
    sizeBytes = remote.sizeBytes ?? data.sizeBytes;
  }

  let blurDataUrl: string | undefined;

  if (kind === "IMAGE" && data.mimeType !== "image/svg+xml") {
    try {
      const buffer = await readRemote(url);
      // EXIF is stripped by re-encoding; sharp drops metadata by default
      const image = sharp(buffer);
      const meta = await image.metadata();
      width = meta.width;
      height = meta.height;
      const lqip = await image.resize(16, undefined, { fit: "inside" }).webp({ quality: 30 }).toBuffer();
      blurDataUrl = `data:image/webp;base64,${lqip.toString("base64")}`;
    } catch (err) {
      console.error("[media] sharp pass failed", err);
    }
  }

  // De-duplicate the display name within the target folder so the library
  // never shows two identical filenames side by side.
  const filename = await uniqueFilename(data.filename, data.folderId ?? null);

  const media = await db.media.create({
    data: {
      kind,
      storageKey: data.storageKey,
      url,
      filename,
      mimeType: data.mimeType,
      sizeBytes,
      width,
      height,
      alt: data.alt,
      folderId: data.folderId ?? undefined,
      blurDataUrl,
    },
  });
  await audit(userId, "media.upload", `Media:${media.id}`, { filename: data.filename });
  return media;
};

export const listMedia = async (params: {
  folderId?: string | null;
  kind?: MediaKind;
  query?: string;
  trash?: boolean;
  cursor?: string;
  take?: number;
}) => {
  const take = Math.min(params.take ?? 60, 120);
  const where = {
    deletedAt: params.trash ? { not: null } : null,
    ...(params.kind ? { kind: params.kind } : {}),
    ...(params.query
      ? {
          OR: [
            { filename: { contains: params.query, mode: "insensitive" as const } },
            { alt: { contains: params.query, mode: "insensitive" as const } },
          ],
        }
      : params.trash
        ? {}
        : // A specific folder id filters to that folder. "All" and the media
          // picker send no folder id (null/undefined) and must show media from
          // EVERY folder, not just un-filed root items — that was the bug where
          // images inside folders vanished from "All" and the picker.
          params.folderId == null
          ? {}
          : { folderId: params.folderId }),
  };
  const items = await db.media.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: take + 1,
    ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
  });
  const nextCursor = items.length > take ? items[take].id : null;
  return { items: items.slice(0, take), nextCursor };
};

export const updateMedia = async (
  userId: string,
  id: string,
  data: Partial<{ filename: string; alt: string; caption: string; focalX: number; focalY: number; folderId: string | null }>,
) => {
  let patch = data;
  // A rename that would collide with another file in the same folder is
  // auto-suffixed. If the file is also being moved (folderId in this patch),
  // de-duplicate against the destination folder, not the current one.
  if (data.filename !== undefined) {
    const current = await db.media.findUnique({ where: { id }, select: { folderId: true } });
    const targetFolder = data.folderId !== undefined ? data.folderId : (current?.folderId ?? null);
    patch = { ...data, filename: await uniqueFilename(data.filename, targetFolder, id) };
  }
  const media = await db.media.update({ where: { id }, data: patch });
  await audit(userId, "media.update", `Media:${id}`);
  return media;
};

export const trashMedia = async (userId: string, ids: string[]) => {
  await db.media.updateMany({ where: { id: { in: ids } }, data: { deletedAt: new Date() } });
  await audit(userId, "media.trash", `Media:${ids.join(",")}`);
};

export const restoreMedia = async (userId: string, ids: string[]) => {
  await db.media.updateMany({ where: { id: { in: ids } }, data: { deletedAt: null } });
  await audit(userId, "media.restore", `Media:${ids.join(",")}`);
};

export const purgeMedia = async (userId: string, ids?: string[]) => {
  const where = ids
    ? { id: { in: ids }, deletedAt: { not: null } }
    : { deletedAt: { lt: new Date(Date.now() - 30 * 24 * 3600 * 1000) } };
  const doomed = await db.media.findMany({ where, select: { id: true, storageKey: true } });

  // Delete each asset independently: one ImageKit failure must not abort the
  // batch. Only rows whose object was actually removed get deleted from the DB;
  // a failed one stays in the trash so it can be retried, never orphaned.
  const removedIds: string[] = [];
  for (const media of doomed) {
    try {
      await deleteObject(media.storageKey);
      removedIds.push(media.id);
    } catch (err) {
      console.error(`[media] purge failed for Media:${media.id} (${media.storageKey})`, err);
    }
  }

  if (removedIds.length > 0) {
    await db.media.deleteMany({ where: { id: { in: removedIds } } });
    await audit(userId, "media.purge", `Media:${removedIds.length} items`);
  }
  return removedIds.length;
};

// ── Folders ──────────────────────────────────────────────────────────────────

export const listFolders = () => db.mediaFolder.findMany({ orderBy: { name: "asc" } });

export const createFolder = (name: string, parentId?: string | null) =>
  db.mediaFolder.create({ data: { name, parentId: parentId ?? undefined } });

export const renameFolder = (id: string, name: string) => db.mediaFolder.update({ where: { id }, data: { name } });

export const deleteFolder = async (id: string) => {
  // Media inside moves to the root rather than being lost
  await db.media.updateMany({ where: { folderId: id }, data: { folderId: null } });
  await db.mediaFolder.delete({ where: { id } });
};

// ── Usage tracking ───────────────────────────────────────────────────────────

export const findMediaUsage = async (mediaId: string) => {
  const [pages, postCovers, seoUsages] = await Promise.all([
    db.page.findMany({
      where: { revisions: { some: {} } },
      select: { id: true, path: true, title: true, publishedRevision: { select: { sections: true } } },
    }),
    db.post.findMany({ where: { coverImageId: mediaId }, select: { id: true, title: true, slug: true } }),
    db.seo.findMany({ where: { ogImageId: mediaId }, select: { pageId: true, postId: true } }),
  ]);

  const usesMedia = (sections: unknown): boolean => {
    const walkProps = (value: unknown): boolean => {
      if (Array.isArray(value)) return value.some(walkProps);
      if (!value || typeof value !== "object") return false;
      const obj = value as Record<string, unknown>;
      if (obj.id === mediaId && typeof obj.url === "string") return true;
      return Object.values(obj).some(walkProps);
    };
    const walk = (nodes: SectionNode[]): boolean =>
      nodes.some((node) => walkProps(node.props) || (node.children ?? []).some((slot) => walk(slot)));
    return Array.isArray(sections) && walk(sections as SectionNode[]);
  };

  return {
    pages: pages
      .filter((page) => usesMedia(page.publishedRevision?.sections))
      .map(({ id, path, title }) => ({ id, path, title })),
    posts: postCovers,
    seoCount: seoUsages.length,
  };
};
