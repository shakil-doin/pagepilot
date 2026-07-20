// Shared types and helpers for the media library screen.
import type { MediaRow } from "@/services/media";

export type MediaFolderRow = {
  id: string;
  name: string;
  parentId: string | null;
};

// What the main panel is showing: everything, one folder, or the trash.
export type MediaView = { type: "all" } | { type: "folder"; folderId: string } | { type: "trash" };

export type MediaKindFilter = "ALL" | "IMAGE" | "VIDEO" | "FILE";

export type MediaUsage = {
  pages: { id: string; path: string; title: string }[];
  posts: { id: string; title: string; slug: string }[];
  seoCount: number;
};

export const mediaListUrl = (view: MediaView, kind: MediaKindFilter, query: string, cursor?: string): string => {
  const params = new URLSearchParams();
  if (view.type === "trash") params.set("trash", "1");
  if (view.type === "folder") params.set("folderId", view.folderId);
  if (kind !== "ALL") params.set("kind", kind);
  if (query) params.set("query", query);
  if (cursor) params.set("cursor", cursor);
  return `/api/studio/media?${params}`;
};

export const usageSummary = (usage: MediaUsage): string => {
  const parts: string[] = [];
  if (usage.pages.length) parts.push(`${usage.pages.length} page${usage.pages.length === 1 ? "" : "s"}`);
  if (usage.posts.length) parts.push(`${usage.posts.length} post${usage.posts.length === 1 ? "" : "s"}`);
  if (usage.seoCount) parts.push(`${usage.seoCount} SEO setting${usage.seoCount === 1 ? "" : "s"}`);
  return parts.join(", ");
};

export const isMissingAlt = (media: MediaRow): boolean => media.kind === "IMAGE" && !media.alt;
