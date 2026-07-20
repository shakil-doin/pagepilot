export type PostStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";

export const POST_STATUS_BADGE = {
  DRAFT: "warning",
  SCHEDULED: "info",
  PUBLISHED: "success",
  ARCHIVED: "outline",
} as const;
