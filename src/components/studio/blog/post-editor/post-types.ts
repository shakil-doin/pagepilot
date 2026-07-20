import type { MediaRow } from "@/services/media";
import type { SeoPanelValue } from "@/components/studio/seo/seo-panel";
import type { PostStatus } from "@/components/studio/blog/post-status";

// Full post as returned by GET /api/studio/blog/posts/:id.
export type StudioPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: unknown;
  status: PostStatus;
  publishedAt: string | null;
  scheduledFor: string | null;
  updatedAt: string;
  authorId: string;
  author?: { id: string; name: string | null } | null;
  coverImageId: string | null;
  coverImage: MediaRow | null;
  categories: { id: string; name: string; slug: string }[];
  tags: { id: string; name: string; slug: string }[];
  seo: SeoPanelValue | null;
};
