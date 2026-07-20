import type { Role, PageAccess } from "@/generated/prisma/enums";

// Single source of truth for the role capability matrix (§16).
// Consumed by both the Studio UI (to hide controls) and every API handler.

export type Capability =
  | "users.manage"
  | "settings.manage"
  | "theme.manage"
  | "navigation.manage"
  | "seo.manage"
  | "pages.manage" // create/delete/manage all pages
  | "pages.edit.granted"
  | "pages.publish.granted"
  | "blog.publish"
  | "blog.draft"
  | "media.manage"
  | "widgets.custom"
  | "widgets.global"
  | "icons.install"
  | "audit.view";

const MATRIX: Record<Role, Capability[]> = {
  SUPERADMIN: [
    "users.manage",
    "settings.manage",
    "theme.manage",
    "navigation.manage",
    "seo.manage",
    "pages.manage",
    "pages.edit.granted",
    "pages.publish.granted",
    "blog.publish",
    "blog.draft",
    "media.manage",
    "widgets.custom",
    "widgets.global",
    "icons.install",
    "audit.view",
  ],
  ADMIN: [
    "theme.manage",
    "navigation.manage",
    "seo.manage",
    "pages.manage",
    "pages.edit.granted",
    "pages.publish.granted",
    "blog.publish",
    "blog.draft",
    "media.manage",
    "widgets.custom",
    "widgets.global",
    "icons.install",
  ],
  MODERATOR: ["pages.edit.granted", "pages.publish.granted", "blog.publish", "blog.draft", "media.manage"],
  EDITOR: ["pages.edit.granted", "blog.draft", "media.manage"],
};

export const can = (role: Role, capability: Capability): boolean =>
  MATRIX[role]?.includes(capability) ?? false;

export const isAdmin = (role: Role): boolean => role === "SUPERADMIN" || role === "ADMIN";

// Ranking used when a grant level must satisfy a required level.
const ACCESS_RANK: Record<PageAccess, number> = { VIEW: 0, EDIT: 1, PUBLISH: 2 };

export const accessSatisfies = (granted: PageAccess, required: PageAccess): boolean =>
  ACCESS_RANK[granted] >= ACCESS_RANK[required];
