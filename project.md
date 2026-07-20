# PagePilot — Project Proposal & Build Specification

> A section-driven, performance-first CMS built with Next.js, PostgreSQL and Prisma.
> This document is a complete, self-contained build spec. Paste it into an AI agent
> (or hand it to a developer) and the system can be built from it without further context.

---

## Table of Contents

1. [Vision & Business Case](#1-vision--business-case)
2. [Product Name](#2-product-name)
3. [Guiding Principles (Non-Negotiable)](#3-guiding-principles-non-negotiable)
4. [Architecture Overview](#4-architecture-overview)
5. [Tech Stack](#5-tech-stack)
6. [Folder Structure](#6-folder-structure)
7. [Database Schema (Prisma)](#7-database-schema-prisma)
8. [The Widget System](#8-the-widget-system)
9. [The Page Builder (Drag & Drop)](#9-the-page-builder-drag--drop)
10. [Rendering & Performance Strategy](#10-rendering--performance-strategy)
11. [Global Styles & Design Tokens (Theme Manager)](#11-global-styles--design-tokens-theme-manager)
12. [Media Library](#12-media-library)
13. [Blog Module](#13-blog-module)
14. [SEO System](#14-seo-system)
15. [Icon System](#15-icon-system)
16. [Authentication, Roles & Page-Level Permissions](#16-authentication-roles--page-level-permissions)
17. [Settings (Everything in the UI)](#17-settings-everything-in-the-ui)
18. [Admin UI Design Language & Color System](#18-admin-ui-design-language--color-system)
19. [API Design](#19-api-design)
20. [Developer Documentation Deliverable](#20-developer-documentation-deliverable)
21. [Build Phases & Acceptance Criteria](#21-build-phases--acceptance-criteria)
22. [Guardrails for the Implementing Agent](#22-guardrails-for-the-implementing-agent)
23. [Environment Variables](#23-environment-variables)

---

## 1. Vision & Business Case

### The problem today

The current workflow (proven on the trade2sync marketing site) is **config-driven pages**:
a developer writes section components once, registers them in a section registry, and
publishes pages by writing typed `PageConfig` objects (`{ path, metadata, sections[] }`)
in the code editor. It is fast and type-safe, but **every content change requires a
developer, a commit, and a deploy**. Marketing cannot ship a landing page, fix a typo,
swap a hero image, or tune SEO metadata without engineering time.

### The solution

PagePilot keeps the exact same proven architecture, but **moves the `PageConfig` from
TypeScript files into PostgreSQL** and puts a modern visual builder on top of it:

- **Developers only write widgets** (section components). Nothing else. One component,
  one schema, one registry line. Same one-component-per-concern discipline as today.
- **Everyone else works in the CMS UI**: pages, content, SEO, colors, media, blog,
  navigation, settings, users. Zero code, zero deploys for content changes.
- **The public site stays as fast as a hand-coded site.** Pages are statically rendered
  React Server Components with on-demand revalidation. The builder's JavaScript never
  ships to visitors. The CMS must never make the site slower than the current
  hand-written approach; that is the primary acceptance test.

### Business logic summary

| Actor | What they do | Where |
| --- | --- | --- |
| Developer | Creates widgets (components + prop schemas), maintains the platform | Code editor, `pnpm` |
| Superadmin | Everything, plus user management, roles, settings, danger zone | CMS UI |
| Admin | Pages, blog, media, theme, SEO, navigation | CMS UI |
| Moderator / Editor | Content editing on pages they are granted, blog drafts | CMS UI |
| Visitor | Reads a fast, SEO-perfect static site | Public site |

One Next.js project contains both the public site renderer and the CMS studio.
One PostgreSQL database, managed through Prisma, holds all content.

---

## 2. Product Name

**Primary recommendation: `PagePilot`** (package/repo name: `pagepilot`).

Rationale: it says exactly what the product does (you pilot your pages instead of
coding them), it is short, memorable, easy to say, and works as a CLI/package name.
The admin app is called **PagePilot Studio**; the rendering side is the
**PagePilot Engine**.

Alternates if the name is unavailable where it matters to you:

| Name | Angle |
| --- | --- |
| `Sectionry` | Built around sections/widgets, the core concept |
| `Buildora` | The builder is the hero feature |
| `Craftdeck` | Crafting pages from a deck of widgets |

Everything below uses `PagePilot`. A global rename is a find-and-replace.

---

## 3. Guiding Principles (Non-Negotiable)

These override any implementation convenience. The implementing agent must check every
feature against this list.

1. **Speed first.** The public site ships zero builder code, zero CMS code, zero
   client-side data fetching for content. Published pages are static (SSG + ISR with
   tag-based revalidation). Lighthouse performance ≥ 95 on a published page with 10+
   sections is a hard acceptance criterion.
2. **Developers touch code only to create widgets.** Every other operation (pages,
   copy, images, colors, fonts, SEO, redirects, navigation, users, scripts, settings)
   happens in the Studio UI.
3. **Server-first.** React Server Components by default; `"use client"` only at
   interactive leaves. The builder itself is a client app, the rendered site is not.
4. **Typed end to end.** Widget props are validated with Zod at save time and at render
   time. Bad data cannot be published.
5. **Nothing hardcoded.** Content in the database, secrets in env (read once into a
   typed `SITE`-style config object, never `process.env` scattered in handlers),
   design tokens in the theme table.
6. **pnpm only.** Never `npm` or `yarn`, anywhere, including docs and scripts.
7. **Every destructive action is recoverable.** Pages have revisions, media has a
   trash, users are deactivated rather than deleted. Publish/rollback is one click.
8. **Modern, comfortable UI.** The Studio must feel like Framer/Webflow/Notion, not
   like a 2012 admin panel. Keyboard shortcuts, command palette, optimistic UI,
   autosave, inline editing.

---

## 4. Architecture Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                        ONE NEXT.JS PROJECT                         │
│                                                                    │
│  app/(site)/[[...slug]]      app/studio/**           app/api/**   │
│  ─ PUBLIC RENDERER           ─ CMS STUDIO             ─ ROUTES     │
│  ─ RSC, static, ISR          ─ client-heavy builder   ─ REST-ish   │
│  ─ reads published JSON      ─ auth-guarded           ─ zod-valid  │
│  ─ zero CMS JS shipped       ─ drag & drop, forms     ─ RBAC-check │
│                                                                    │
│              └──────────────┬─────────────┘                        │
│                     modules/** (server-only domain logic)          │
│                     widgets/** (developer-authored sections)       │
│                             │                                      │
│                      Prisma Client (typed)                         │
└─────────────────────────────┼──────────────────────────────────────┘
                              │
                       PostgreSQL
                (pages, revisions, blog, media,
                 theme tokens, users, settings)
                              │
                    S3-compatible object storage
                    (media originals + renditions)
```

**The key data flow (mirrors the proven config-driven pattern):**

1. Developer writes a widget component + Zod prop schema and registers it in the
   **widget registry** (one line). This is the only code step.
2. Studio reads the registry manifest (schemas serialized to JSON Schema) and
   auto-generates the builder's property panels for every widget.
3. Editors compose pages as an ordered tree of widget instances. The page is stored as
   JSON in PostgreSQL (a `PageRevision`).
4. On **Publish**, the revision is validated against every widget schema, snapshotted,
   and `revalidateTag("page:<path>")` regenerates exactly that static page.
5. The public catch-all route `app/(site)/[[...slug]]/page.tsx` loads the published
   revision, maps `type → component` through the registry, and renders pure RSC.

This is the same mental model as the existing `sectionRegistry` + `dynamicPages[]`
architecture, with the database replacing the `*.page.ts` files.

---

## 5. Tech Stack

| Concern | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js (latest stable), App Router, RSC | One project: site + studio + API |
| Language | TypeScript `strict` | No `any` in domain code |
| Database | PostgreSQL 16+ | Single source of truth for content |
| ORM | Prisma (latest), client generated to `src/generated/prisma` | Migrations via `prisma migrate` |
| Styling | Tailwind CSS v4 (CSS-first, no `tailwind.config.js`) | Theme tokens emitted as CSS variables |
| UI kit (Studio) | shadcn/ui on Radix primitives | Generated into `src/components/ui` |
| Drag & drop | `@dnd-kit/core` + `@dnd-kit/sortable` | Accessible, keyboard-capable DnD |
| Rich text | TipTap (ProseMirror) | Blog editor + rich-text widget fields |
| Forms | `react-hook-form` + `zod` + `@hookform/resolvers` | All Studio forms |
| Schema → UI | Zod schemas serialized with `zod-to-json-schema` | Auto-generated widget prop panels |
| Auth | Auth.js (NextAuth v5) + Prisma adapter, credentials + optional OAuth | JWT session, role in token |
| Icons | `@phosphor-icons/react` (Studio + default site set) + Iconify JSON collections (runtime-installable) | See §15 |
| Media processing | `sharp` (server), S3-compatible storage via `@aws-sdk/client-s3` | Works with S3/R2/MinIO |
| Data fetching (Studio) | `@tanstack/react-query` | Optimistic updates, cache invalidation |
| Validation at API edge | Zod on every route handler input | Never trust the client |
| Toasts | `sonner` | |
| Charts (dashboard) | `recharts` | |
| Package manager | **pnpm only** | Enforce with `"preinstall": "npx only-allow pnpm"` |

---

## 6. Folder Structure

Follow this exactly. It extends the structure already proven in the trade2sync repo
(config-driven, one component per concern, server logic in `modules/`).

```
pagepilot/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                      # seeds superadmin, default theme, demo page
├── public/                          # static assets of the platform itself only
├── docs/                            # developer documentation (see §20)
│   ├── DEVELOPER.md                 # how to maintain the platform
│   ├── WIDGETS.md                   # how to author a widget (the main doc)
│   └── DEPLOY.md                    # infra, env, backup, upgrade notes
├── src/
│   ├── app/
│   │   ├── layout.tsx               # root: fonts, theme CSS variable injection
│   │   ├── globals.css              # Tailwind v4 @theme tokens (Studio palette §18)
│   │   ├── (site)/                  # PUBLIC SITE — fast path, RSC only
│   │   │   ├── layout.tsx           # site chrome from DB (header/footer settings)
│   │   │   ├── [[...slug]]/page.tsx # optional catch-all: renders published pages
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx         # blog index (paginated, static)
│   │   │   │   └── [slug]/page.tsx  # blog post (static, ISR)
│   │   │   ├── sitemap.ts           # generated from published pages + posts
│   │   │   └── robots.ts            # from SEO settings
│   │   ├── studio/                  # CMS STUDIO — auth-guarded in layout.tsx
│   │   │   ├── layout.tsx           # auth() + role guard + sidebar shell
│   │   │   ├── page.tsx             # dashboard (stats, recent edits, drafts)
│   │   │   ├── pages/               # page list, tree, builder
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/builder/page.tsx
│   │   │   ├── blog/                # posts, categories, tags, authors
│   │   │   ├── media/               # media library
│   │   │   ├── widgets/             # widget browser + custom widget composer
│   │   │   ├── theme/               # global colors, typography, spacing, buttons
│   │   │   ├── navigation/          # header/footer menu builder
│   │   │   ├── seo/                 # global SEO defaults, redirects, robots
│   │   │   ├── icons/               # icon set manager (§15)
│   │   │   ├── users/               # users, roles, page permissions
│   │   │   └── settings/            # site settings, scripts, integrations, danger zone
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── studio/              # RBAC-guarded CMS API (see §19)
│   │   │   │   ├── pages/…          # CRUD + publish + revisions
│   │   │   │   ├── blog/…
│   │   │   │   ├── media/…          # upload (presigned), list, trash
│   │   │   │   ├── theme/…
│   │   │   │   ├── widgets/…        # manifest + custom widget CRUD
│   │   │   │   ├── icons/…
│   │   │   │   ├── users/…
│   │   │   │   └── settings/…
│   │   │   ├── revalidate/route.ts  # tag revalidation (internal, key-guarded)
│   │   │   └── preview/route.ts     # enables Next.js draftMode for previews
│   │   └── (auth)/login/page.tsx    # Studio login (own minimal layout)
│   ├── widgets/                     # ★ DEVELOPER TERRITORY — the only code you touch
│   │   ├── registry.ts              # widget key → { component, schema, meta }
│   │   ├── manifest.ts              # serializes registry → JSON manifest for Studio
│   │   ├── hero/
│   │   │   ├── index.tsx            # the RSC section component
│   │   │   ├── schema.ts            # Zod props schema + editor annotations
│   │   │   └── preview.png          # thumbnail shown in the builder palette
│   │   ├── rich-text/ …             # primitives used by the custom-widget composer
│   │   ├── image/ … video/ … button-row/ … columns/ … spacer/ …
│   │   ├── feature-grid/ … faq/ … cta/ … testimonial-slider/ … logo-marquee/ …
│   │   └── pricing-table/ …
│   ├── components/
│   │   ├── ui/                      # shadcn/ui primitives (generated)
│   │   ├── studio/                  # Studio feature components, per-concern folders
│   │   │   ├── builder/             # canvas, palette, layers, inspector, toolbar
│   │   │   ├── media/ blog/ theme/ seo/ users/ settings/ shared/
│   │   └── site/                    # public-site chrome (header/footer renderers)
│   ├── modules/                     # server-only domain logic (never imported client-side)
│   │   ├── pages/                   # page.service.ts, publish.service.ts, revisions
│   │   ├── blog/ media/ theme/ seo/ users/ settings/ icons/ widgets/
│   │   └── auth/                    # auth config, RBAC helpers, permission checks
│   ├── services/                    # client-side API callers (fetch wrappers, react-query)
│   ├── types/                       # shared TS types, re-exported from index.ts
│   ├── hooks/ lib/ providers/       # cn(), utils, query provider, hotkeys
│   ├── config/
│   │   └── app.config.ts            # env read ONCE here → typed APP.* (like SITE.*)
│   └── generated/prisma/            # generated client (gitignored, never edit)
├── package.json                     # pnpm only; preinstall only-allow pnpm
└── next.config.ts
```

**Conventions carried over from the current project (keep them):**

- One component per concern; a feature is a folder with `index.tsx` + sibling parts.
- Kebab-case filenames; arrow-function components; default export; `Props` type.
- `cn()` from `lib/utils.ts`; semantic tokens, never raw hex in components.
- Server logic in `modules/`, client callers in `services/`, types in `types/`.
- Comments explain *why*, never restate *what*.
- No em dash in any user-facing copy the platform ships or seeds.

---

## 7. Database Schema (Prisma)

Complete schema. The implementing agent should use this as the starting migration and
may add indexes as query patterns emerge.

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

// ── Users, roles, permissions ────────────────────────────────────────────────

enum Role {
  SUPERADMIN // everything + users + settings + danger zone
  ADMIN      // all content, theme, SEO, media, navigation
  MODERATOR  // edit/publish only pages granted via PagePermission; blog drafts
  EDITOR     // edit only (no publish) on granted pages; own blog drafts
}

enum UserStatus {
  ACTIVE
  DISABLED
}

model User {
  id            String     @id @default(cuid())
  name          String
  email         String     @unique
  emailVerified DateTime?
  image         String?
  passwordHash  String?
  role          Role       @default(EDITOR)
  status        UserStatus @default(ACTIVE)
  accounts      Account[]
  sessions      Session[]
  permissions   PagePermission[]
  revisions     PageRevision[]
  posts         Post[]
  auditLogs     AuditLog[]
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
}

// Auth.js standard models (Account, Session, VerificationToken) — include as-is
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String
  expires    DateTime

  @@unique([identifier, token])
}

// Per-page grants for MODERATOR/EDITOR. ADMIN+ bypasses this table.
enum PageAccess {
  VIEW
  EDIT
  PUBLISH
}

model PagePermission {
  id     String     @id @default(cuid())
  userId String
  pageId String
  access PageAccess @default(EDIT)
  user   User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  page   Page       @relation(fields: [pageId], references: [id], onDelete: Cascade)

  @@unique([userId, pageId])
}

// Every write in the Studio logs one row: who, what, before/after summary.
model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  action    String   // "page.publish", "theme.update", "user.role.change", …
  entity    String   // "Page:ckx…", "Setting:seo.defaults"
  detail    Json?
  createdAt DateTime @default(now())
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([createdAt])
  @@index([entity])
}

// ── Pages & builder ──────────────────────────────────────────────────────────

enum PageStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model Page {
  id           String       @id @default(cuid())
  // Full path including leading slash: "/", "/pricing", "/product/cloud-copier"
  path         String       @unique
  title        String       // internal name shown in Studio lists
  status       PageStatus   @default(DRAFT)
  // The revision currently live on the site (null until first publish)
  publishedRevisionId String? @unique
  publishedRevision   PageRevision? @relation("PublishedRevision", fields: [publishedRevisionId], references: [id])
  revisions    PageRevision[] @relation("PageRevisions")
  permissions  PagePermission[]
  seo          Seo?
  // Optional layout flags: hide header/footer for landers, etc.
  hideHeader   Boolean      @default(false)
  hideFooter   Boolean      @default(false)
  // Lock a page so only ADMIN+ can edit regardless of grants
  locked       Boolean      @default(false)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  @@index([status])
}

// Immutable snapshots. The builder autosaves into a rolling DRAFT revision;
// Publish freezes it. Rollback = point publishedRevisionId at an old row.
model PageRevision {
  id        String   @id @default(cuid())
  pageId    String
  page      Page     @relation("PageRevisions", fields: [pageId], references: [id], onDelete: Cascade)
  publishedFor Page? @relation("PublishedRevision")
  // Ordered section tree: [{ id, type, props, spacing, responsive, adminLabel }]
  // Validated against every widget's Zod schema before save AND before publish.
  sections  Json
  version   Int      // monotonic per page
  note      String?  // optional "what changed" note
  authorId  String?
  author    User?    @relation(fields: [authorId], references: [id], onDelete: SetNull)
  createdAt DateTime @default(now())

  @@unique([pageId, version])
  @@index([pageId, createdAt])
}

// ── SEO ──────────────────────────────────────────────────────────────────────

model Seo {
  id              String  @id @default(cuid())
  pageId          String? @unique
  page            Page?   @relation(fields: [pageId], references: [id], onDelete: Cascade)
  postId          String? @unique
  post            Post?   @relation(fields: [postId], references: [id], onDelete: Cascade)

  metaTitle       String?
  metaDescription String?
  canonicalUrl    String?
  // "index,follow" | "noindex,follow" | "noindex,nofollow" …
  robots          String?
  ogTitle         String?
  ogDescription   String?
  ogImageId       String?
  ogImage         Media?  @relation(fields: [ogImageId], references: [id], onDelete: SetNull)
  ogType          String? // "website" | "article"
  twitterCard     String? // "summary_large_image" default
  // Raw JSON-LD objects, array; rendered into <script type="application/ld+json">
  structuredData  Json?
  // Exclude from sitemap.xml without noindexing
  excludeFromSitemap Boolean @default(false)
  sitemapPriority    Float?  // 0.0–1.0
  sitemapChangeFreq  String? // "daily" | "weekly" | …
}

model Redirect {
  id         String   @id @default(cuid())
  fromPath   String   @unique
  toPath     String
  permanent  Boolean  @default(true) // 308 vs 307
  createdAt  DateTime @default(now())
}

// ── Blog ─────────────────────────────────────────────────────────────────────

enum PostStatus {
  DRAFT
  SCHEDULED
  PUBLISHED
  ARCHIVED
}

model Post {
  id           String     @id @default(cuid())
  slug         String     @unique
  title        String
  excerpt      String?
  // TipTap JSON document. Rendered server-side to HTML at publish (cached).
  content      Json
  contentHtml  String?    // pre-rendered HTML snapshot for fast public reads
  coverImageId String?
  coverImage   Media?     @relation(fields: [coverImageId], references: [id], onDelete: SetNull)
  status       PostStatus @default(DRAFT)
  publishedAt  DateTime?
  scheduledFor DateTime?
  authorId     String
  author       User       @relation(fields: [authorId], references: [id])
  categories   Category[]
  tags         Tag[]
  seo          Seo?
  readingMins  Int?
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  @@index([status, publishedAt])
}

model Category {
  id    String @id @default(cuid())
  slug  String @unique
  name  String
  posts Post[]
}

model Tag {
  id    String @id @default(cuid())
  slug  String @unique
  name  String
  posts Post[]
}

// ── Media ────────────────────────────────────────────────────────────────────

enum MediaKind {
  IMAGE
  VIDEO
  FILE
}

model MediaFolder {
  id       String        @id @default(cuid())
  name     String
  parentId String?
  parent   MediaFolder?  @relation("Tree", fields: [parentId], references: [id], onDelete: Cascade)
  children MediaFolder[] @relation("Tree")
  media    Media[]
}

model Media {
  id          String     @id @default(cuid())
  kind        MediaKind
  // Storage key of the original in S3-compatible storage
  storageKey  String     @unique
  url         String     // public CDN URL
  filename    String
  mimeType    String
  sizeBytes   Int
  width       Int?
  height      Int?
  durationSec Float?     // video
  // Mandatory for images used in content — builder blocks publish without it
  alt         String?
  caption     String?
  // 0–1 coordinates; renderer maps to object-position for art-directed crops
  focalX      Float?
  focalY      Float?
  blurDataUrl String?    // LQIP placeholder generated at upload
  folderId    String?
  folder      MediaFolder? @relation(fields: [folderId], references: [id], onDelete: SetNull)
  deletedAt   DateTime?  // soft delete → Trash view, purge after 30 days
  createdAt   DateTime   @default(now())
  seoUsages   Seo[]
  postCovers  Post[]

  @@index([kind, deletedAt])
  @@index([folderId])
}

// ── Theme (global colors, typography, styles) ────────────────────────────────

model Theme {
  id        String   @id @default(cuid())
  name      String
  active    Boolean  @default(false)
  // Token map: { colors: {...}, fonts: {...}, radii: {...}, spacing: {...},
  //              buttons: {...}, container: {...} } — shape defined in §11
  tokens    Json
  updatedAt DateTime @updatedAt
  createdAt DateTime @default(now())
}

// ── Navigation (header/footer menus) ─────────────────────────────────────────

model Menu {
  id    String     @id @default(cuid())
  // "header" | "footer" | custom slots
  slot  String     @unique
  // Nested items: [{ label, href, icon?, badge?, children: [...] }]
  items Json
  updatedAt DateTime @updatedAt
}

// ── Widgets ──────────────────────────────────────────────────────────────────

// Global widget: ONE widget instance reused by reference on many pages.
// Editing it updates every page that references it (those pages re-revalidate).
model GlobalWidget {
  id        String   @id @default(cuid())
  name      String
  type      String   // registry key
  props     Json
  updatedAt DateTime @updatedAt
  createdAt DateTime @default(now())
}

// Custom widget: composed in the Studio from primitive widgets (§8.4) when no
// coded widget fits. Stored as a reusable section tree, inserted like any widget.
model CustomWidget {
  id          String   @id @default(cuid())
  name        String
  description String?
  thumbnail   String?
  // Same shape as PageRevision.sections but scoped to this widget's children
  tree        Json
  // Editable fields exposed to the inspector when instances are placed:
  // [{ key, label, type, target: "<childId>.<propPath>" }]
  exposedProps Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// ── Icon sets (runtime-installable, §15) ─────────────────────────────────────

model IconSet {
  id          String   @id @default(cuid())
  // Iconify collection prefix: "ph", "lucide", "tabler", "mdi", …
  prefix      String   @unique
  name        String
  installedAt DateTime @default(now())
  // Iconify collection JSON (icon name → SVG body). Served to the picker and
  // inlined into pages at render time — no client icon library needed.
  data        Json
}

// ── Settings (key-value, all UI-managed) ─────────────────────────────────────

model Setting {
  key       String   @id // "site.general", "seo.defaults", "scripts.head", …
  value     Json
  updatedAt DateTime @updatedAt
}
```

---

## 8. The Widget System

The heart of PagePilot. A **widget** = a section component. Three kinds:

| Kind | Created by | Stored | Example |
| --- | --- | --- | --- |
| **Coded widget** | Developer, in `src/widgets/` | Code (registry) | Hero, FAQ, Pricing table |
| **Global widget** | Editor, in Studio | DB row, referenced by id | Site-wide CTA banner |
| **Custom widget** | Editor, in Studio composer | DB row (tree of primitives) | One-off layout no coded widget fits |

### 8.1 The widget contract (developer side)

Creating a widget is exactly three files plus one registry line:

```
src/widgets/feature-grid/
├── index.tsx      # RSC component — receives validated props, renders the section
├── schema.ts      # Zod schema + editor annotations (drives the builder form)
└── preview.png    # 640×400 thumbnail for the builder palette
```

`schema.ts` uses a small annotation helper so one schema drives both validation and
the auto-generated inspector form:

```ts
import { z } from "zod";
import { field, widgetMeta } from "@/widgets/lib";

export const meta = widgetMeta({
  key: "feature-grid",
  name: "Feature Grid",
  category: "Content",            // palette grouping
  description: "Icon + title + text cards in a responsive grid",
});

export const schema = z.object({
  title: field(z.string().min(1), { control: "text", label: "Title" }),
  description: field(z.string().optional(), { control: "textarea", label: "Description" }),
  columns: field(z.number().int().min(2).max(4).default(3), {
    control: "segmented", label: "Columns (desktop)",
  }),
  items: field(
    z.array(z.object({
      icon:  field(z.string(), { control: "icon" }),        // opens the icon picker
      title: field(z.string(), { control: "text" }),
      text:  field(z.string(), { control: "textarea" }),
      image: field(z.string().optional(), { control: "media", accept: "image" }),
      link:  field(z.string().optional(), { control: "link" }), // page/URL picker
    })),
    { control: "list", label: "Items", itemLabel: "title" },
  ),
  background: field(z.enum(["none", "muted", "navy"]).default("none"), {
    control: "select", label: "Background",
  }),
});
```

**Supported `control` types the Studio must implement** (the complete inspector kit):
`text`, `textarea`, `richtext` (TipTap inline), `number`, `segmented`, `select`,
`switch`, `color` (token-aware picker: offers theme tokens first, raw color as
fallback), `media` (opens media library, image or video), `icon` (opens icon picker),
`link` (internal page picker + external URL + anchor), `list` (sortable repeater with
add/remove/duplicate), `group` (collapsible object), `slider`, `date`.

The registry (`src/widgets/registry.ts`) mirrors the current `sectionRegistry` and
stays the single source of truth:

```ts
export const widgetRegistry = {
  "feature-grid": { component: FeatureGrid, schema, meta },
  // …
} as const;
```

`src/widgets/manifest.ts` converts every schema to JSON Schema
(`zod-to-json-schema`) + meta + control annotations and exposes it at
`GET /api/studio/widgets/manifest`. **The Studio never imports widget components**;
it renders forms from the manifest and previews via the render route (§9.3). This is
what keeps the builder decoupled and the site fast.

### 8.2 Ship a starter library (so the CMS is useful on day one)

Implement these coded widgets in the first build (each follows the contract):

- **Primitives** (also power the custom-widget composer): `rich-text`, `heading`,
  `image`, `video` (upload or YouTube/Vimeo embed), `button-row`, `spacer`,
  `divider`, `columns` (2–4 col container that accepts child widgets), `html-embed`
  (sanitized, ADMIN-only).
- **Marketing sections**: `hero`, `feature-grid`, `logo-marquee`, `testimonial-slider`,
  `faq` (accordion + FAQ JSON-LD emitted automatically), `cta`, `pricing-table`,
  `stats-row`, `steps`, `comparison`, `team-grid`, `contact-form` (posts to a
  configurable endpoint/email), `newsletter`, `blog-latest` (pulls newest posts).

### 8.3 Global widgets

Any placed widget can be promoted: **"⋯ → Save as global widget."** The instance is
replaced by a reference (`{ type: "global", globalId }`). Pages render the current
global props; editing a global widget lists affected pages and revalidates all of them
on save. "Detach" copies props back inline.

### 8.4 Custom widgets (built in the CMS, no code)

When no coded widget fits the content, editors open **Studio → Widgets → New custom
widget**: a mini-builder canvas where they compose primitives (`columns`, `rich-text`,
`image`, `button-row`, `spacer`, …), style them with token-aware controls, optionally
expose chosen fields as top-level props (so instances stay editable via a simple form),
and save. The custom widget then appears in the builder palette under "Custom" with its
own thumbnail, insertable and reusable like any coded widget. This is the pressure
valve that keeps developers out of the loop for one-off layouts.

### 8.5 Versioning & safety

- The manifest carries a hash per widget schema. If a developer changes a schema
  incompatibly, affected pages are flagged in Studio ("needs migration") instead of
  breaking; the page renders the last valid published revision until fixed.
- Rendering is defensive: an unknown widget type or invalid props renders nothing in
  production (and a visible red placeholder in preview), never a crash.

---

## 9. The Page Builder (Drag & Drop)

Target feel: Framer/Webflow-level comfort. This is the flagship screen; invest in it.

### 9.1 Layout (three panels + toolbar)

```
┌──────────────────────────────────────────────────────────────────┐
│ ⟵ Pages   /product/cloud-copier   [Desktop|Tablet|Mobile] [Undo] │
│           Saved ✓ 2s ago                [Preview] [Publish ▾]    │
├─────────┬──────────────────────────────────────────┬─────────────┤
│ PALETTE │              LIVE CANVAS                 │  INSPECTOR  │
│ search  │   real rendered page in an iframe        │  (form for  │
│ ─────── │   hover = outline + name tag             │   selected  │
│ ▸ Basic │   click = select                         │   widget,   │
│ ▸ Marketing  drag from palette = insert            │   generated │
│ ▸ Custom│   drag handle = reorder                  │   from its  │
│ ▸ Global│   [+ Add section] between sections       │   schema)   │
│ ─────── │                                          │  Tabs:      │
│ LAYERS  │                                          │  Content /  │
│ (tree,  │                                          │  Style /    │
│ reorder,│                                          │  Advanced   │
│ rename) │                                          │             │
└─────────┴──────────────────────────────────────────┴─────────────┘
```

### 9.2 Must-have interactions

- **Drag & drop** from palette to canvas and reorder within the layers tree
  (`@dnd-kit`, with keyboard support and a drop-indicator line).
- **Click-to-select** on the canvas; breadcrumb for nested selection inside `columns`
  and custom widgets.
- **Inline text editing** directly on the canvas for `text`/`richtext` fields
  (double-click), synced to the inspector.
- **Autosave** (debounced ~800 ms) into the page's rolling draft revision; explicit
  **Publish** with a note. Status chip: `Saved ✓ / Saving… / Offline`.
- **Undo/redo** (⌘Z/⇧⌘Z) over the section tree, at least 50 steps, in-memory per session.
- **Duplicate / delete / hide** per section; **hide per breakpoint** (§9.4).
- **Copy section → paste on another page** (serialized via clipboard).
- **Command palette** (⌘K): jump to page, insert widget, publish, open settings.
- **Empty states** that teach: an empty page shows the palette invitation, not a void.
- **Per-section `adminLabel`** so the layers tree reads "Hero (Summer promo)" instead
  of "hero".

### 9.3 Preview architecture (critical for speed + fidelity)

The canvas is an **iframe of the real site renderer** in Next.js `draftMode`, pointed
at the draft revision: what you see is *exactly* what ships, fonts, tokens and all.
On edit, the Studio PATCHes the draft and refreshes the iframe via
`router.refresh()`-style soft reload (React Server Component refetch), keeping scroll
position. No parallel client-side render engine to maintain, no drift between preview
and production, and zero builder code in the public bundle.

Device toggle = iframe width presets (mobile 390, tablet 768, desktop 1280/full)
with the real site CSS breakpoints doing the work.

### 9.4 Responsive controls (uniform across all widgets)

Every placed section carries a `responsive` envelope the renderer applies generically,
so every widget gets responsive control for free:

```jsonc
{
  "id": "sec_x1",
  "type": "feature-grid",
  "props": { … },
  "spacing": { "top": "lg", "bottom": "lg" },          // token scale, per breakpoint overridable
  "responsive": {
    "hideOn": ["mobile"],                              // render nothing at that breakpoint
    "overrides": {                                     // per-breakpoint prop overrides for
      "mobile": { "columns": 1 },                      // props whose schema opts in via
      "tablet": { "columns": 2 }                       // { responsive: true } annotation
    }
  }
}
```

The page owns vertical rhythm (`spacing`), the widget owns its internal layout —
the same division of responsibility as the current site. Widgets must be built
mobile-first regardless; overrides are for tuning, not for rescuing desktop-only code.

---

## 10. Rendering & Performance Strategy

This section is the reason the CMS "must be fast" requirement holds.

1. **Published pages are static.** The public catch-all uses
   `generateStaticParams` over published paths + ISR. Every page render is tagged:
   `unstable_cache`/`"use cache"` with tags `page:<path>`, `theme`, `menu`,
   `global-widget:<id>`.
2. **Publish = targeted revalidation.** Publishing a page calls
   `revalidateTag("page:/pricing")`. Saving the theme revalidates `theme` (all pages,
   still build-free). Editing a global widget revalidates its tag. No full rebuilds,
   no redeploys, live in seconds.
3. **Zero CMS JavaScript on the public site.** Widgets are RSC; only widgets that are
   genuinely interactive (slider, accordion) have small client leaves. The builder,
   TipTap, dnd-kit, react-query: all under `/studio` only. Enforce with
   `pnpm dlx @next/bundle-analyzer` in CI and a budget: **≤ 90 KB gzipped JS** on a
   published marketing page.
4. **Images**: uploads generate LQIP blur placeholders; renderer uses `next/image`
   with correct `sizes`, `priority` only for the first section, `fill` +
   `object-cover` for backgrounds. Follow the aspect-ratio rules proven in the current
   project (never pair fixed height with `max-w-full`, no `priority` below the fold).
5. **Fonts** via `next/font` with CSS variables; theme picks from a curated font list
   (self-hosted at build), so font changes never introduce render-blocking requests.
6. **Draft mode is the only dynamic path.** Preview requests bypass cache via
   `draftMode()`; production visitors always hit the static shell.
7. **DB discipline**: every list endpoint paginates; Prisma `select` narrow fields;
   indexes as defined in §7. Media library virtualizes its grid.
8. **Acceptance tests** (CI, Lighthouse CI against a seeded demo page):
   Performance ≥ 95, LCP < 1.8 s, CLS < 0.05, TBT < 100 ms on a page with 10 sections.

---

## 11. Global Styles & Design Tokens (Theme Manager)

**Studio → Theme.** User-friendly, visual, and safe: editors change tokens, never CSS.

### 11.1 Token model (stored in `Theme.tokens`)

```jsonc
{
  "colors": {
    "primary":   { "value": "#3565F9", "label": "Primary" },
    "secondary": { "value": "#06174C", "label": "Secondary" },
    "accent":    { "value": "#8BA6FF", "label": "Accent" },
    "background":{ "value": "#FFFFFF", "label": "Background" },
    "surface":   { "value": "#F8FAFC", "label": "Surface" },
    "text":      { "value": "#0F172A", "label": "Heading text" },
    "textMuted": { "value": "#334155", "label": "Body text" },
    "border":    { "value": "#E2E8F0", "label": "Border" },
    "success":   { "value": "#16A34A", "label": "Success" },
    "danger":    { "value": "#EF4444", "label": "Danger" }
    // + user-defined custom tokens, addable in UI
  },
  "gradients": {
    "brand": { "from": "secondary", "to": "primary", "angle": 90 }
  },
  "typography": {
    "headingFont": "Rubik",
    "bodyFont": "Rubik",
    "scale": { "h1": "3.0rem", "h2": "2.25rem", "h3": "1.5rem", "body": "1rem" },
    "headingWeight": 600
  },
  "radii":   { "sm": "0.25rem", "md": "0.5rem", "lg": "0.75rem", "xl": "1rem" },
  "spacing": { "sectionSm": "2rem", "sectionMd": "4rem", "sectionLg": "6rem" },
  "container": { "maxWidth": "1440px", "gutter": "1rem" },
  "buttons": {
    "primary":   { "bg": "primary", "text": "#fff", "radius": "md", "shadow": true },
    "secondary": { "bg": "transparent", "text": "primary", "border": "primary" }
  }
}
```

### 11.2 How tokens reach the page (fast)

The site root layout reads the active theme (cached, tag `theme`) and emits one
inline `<style>:root { --pp-primary: …; }</style>` block. Widgets consume only
`var(--pp-*)` through Tailwind v4 `@theme` mappings. Changing a color in the Studio =
one `revalidateTag("theme")`, and the whole site repaints. No CSS builds, no FOUC.

### 11.3 Theme manager UX

- Color cards with a large swatch, name, and an accessible picker (hex + palette +
  eyedropper); **contrast checker inline** (warns when text/background pairs fall
  below WCAG AA).
- Live preview pane (an iframe of the homepage) updating as you slide values.
- Typography tab: font pair pickers with instant preview, size scale sliders.
- Buttons tab: visual editor for the button variants used by `button-row`/CTAs.
- **Themes are versioned rows**: "Duplicate theme", edit the copy, "Activate" to swap,
  instant rollback by re-activating the previous row.
- Widget color controls always offer tokens first ("Primary, Secondary, Surface…");
  raw hex is an explicit "custom" escape hatch, so a rebrand stays one-screen work.

---

## 12. Media Library

**Studio → Media.** One library for images, video, and files.

- **Upload**: drag & drop multi-upload, direct-to-storage via presigned URLs
  (S3/R2/MinIO through one `storage.service.ts` interface), progress per file.
  Server post-processes with `sharp`: dimensions, LQIP `blurDataUrl`, EXIF strip.
- **Organize**: nested folders, search by filename/alt, filter by kind/usage,
  grid + list views, multi-select bulk move/delete, virtualized grid.
- **Edit in place**: rename, alt text (required before an image can be used in
  content; the builder shows a red badge and blocks publish for missing alt on
  visible images), caption, focal point picker (click the subject; renderer maps to
  `object-position`).
- **Video**: upload (mp4/webm) with poster-frame picker, or paste YouTube/Vimeo URL
  (embed widgets render a lite, click-to-load facade so embeds never hurt LCP).
- **Usage tracking**: every media detail view lists the pages/posts using it;
  deleting warns; deletes are soft (Trash, 30-day purge job).
- **Renditions**: `next/image` handles resizing at the edge; the library stores
  originals only.

---

## 13. Blog Module

**Studio → Blog.** A first-class editorial surface, not a widget afterthought.

- **Editor**: TipTap, Notion-like: slash-command block insertion (headings, image
  from media library, video, quote, code with syntax highlight, callout, table,
  divider, embed, CTA button), bubble toolbar for inline marks, drag handle to
  reorder blocks, autosave, word count + reading time.
- **Post metadata sidebar**: slug (auto from title, editable, uniqueness-checked),
  excerpt, cover image, author picker, categories, tags, status.
- **Workflow**: Draft → (optional) Scheduled (cron/route handler flips SCHEDULED →
  PUBLISHED at `scheduledFor`, then revalidates) → Published → Archived.
  EDITOR/MODERATOR write drafts; publish requires MODERATOR (granted) or ADMIN.
- **Full SEO panel per post** (same `Seo` model as pages, §14) + automatic
  `BlogPosting` JSON-LD, OG image fallback to cover image.
- **Public side**: `/blog` paginated index + category/tag archives + post page,
  all static with tags `post:<slug>` / `blog-index`; RSS feed at `/blog/rss.xml`.
- `contentHtml` is pre-rendered at publish so public reads never parse ProseMirror JSON.

---

## 14. SEO System

Every field a professional SEO setup needs, editable in UI at two levels.

### 14.1 Global defaults (Studio → SEO)

Site name, title template (`%s | Site Name`), default meta description, default OG
image, twitter handle, canonical base URL, `robots.txt` editor with safe presets,
organization JSON-LD (name, logo, sameAs links), verification tags (Google, Bing),
hreflang defaults.

### 14.2 Per page/post (SEO tab in the builder & post editor)

Meta title (with pixel-width counter) · meta description (counter) · canonical URL ·
robots directives (indexable toggle + advanced) · OG title/description/image/type ·
Twitter card type · JSON-LD blocks (guided builders for FAQ, Product, Article,
Breadcrumb + raw JSON escape hatch) · sitemap include/priority/changefreq.

A **Google/social preview card** renders live as you type (desktop + mobile SERP
snippet, OG card).

### 14.3 Automatic

- `sitemap.xml` generated from published pages + posts honoring per-page flags;
  pings on publish.
- `robots.ts` from settings.
- Canonicals default to the page path; trailing-slash and www policy normalized in
  middleware.
- **Redirects manager** (Studio → SEO → Redirects): from → to, 308/307, CSV import,
  loop detection; applied in middleware from a cached map. Renaming a page's path
  offers to auto-create the redirect.
- Per-page **SEO health checklist** in the builder: title present/length, description
  length, exactly one H1 on canvas, image alt coverage, internal links count.

---

## 15. Icon System

Requirement: editors pick icons in the UI, and new icon libraries are installable
**without code changes or redeploys**.

- **Built in**: Phosphor (the house set) ships pre-installed as an Iconify collection.
- **Install more in UI**: Studio → Icons lists the Iconify catalog (Lucide, Tabler,
  Material Symbols, Heroicons, …). "Install" downloads that collection's JSON from the
  Iconify API **once, server-side**, and stores it in the `IconSet` table. From then on
  it is served locally: no runtime third-party calls, works offline, no `pnpm install`
  needed at runtime (pnpm remains the dev-time package manager only).
- **Picker**: the `icon` control opens a searchable, virtualized grid across installed
  sets; recently-used row; weight/variant filter where the set supports it.
- **Rendering**: icons are stored as `"ph:rocket-launch"` refs and **inlined as SVG at
  render time on the server** from the stored collection JSON. Zero icon-font or
  icon-library JS ships to visitors; tree-shaking is perfect by construction.
- Uninstalling a set scans content for usages first and warns.

---

## 16. Authentication, Roles & Page-Level Permissions

- **Auth.js (NextAuth v5)** with credentials (bcrypt) + optional Google OAuth;
  Prisma adapter; JWT sessions carrying `role`. Login page at `/login` with rate
  limiting; optional email-code 2FA for SUPERADMIN.
- **Route guarding**: `app/studio/layout.tsx` calls `auth()` and rejects
  non-CMS roles; every `/api/studio/*` handler re-checks (defense in depth, same
  pattern as the current admin panel). Public site never touches auth.
- **Role capability matrix** (enforced in `modules/auth/permissions.ts`, single
  source of truth consumed by both UI and API):

| Capability | SUPERADMIN | ADMIN | MODERATOR | EDITOR |
| --- | --- | --- | --- | --- |
| Manage users & roles | ✓ | | | |
| Settings, integrations, scripts, danger zone | ✓ | | | |
| Theme, navigation, SEO globals, redirects | ✓ | ✓ | | |
| Create/delete pages, manage all pages | ✓ | ✓ | | |
| Edit/publish granted pages | ✓ | ✓ | ✓ | edit only |
| Blog: publish | ✓ | ✓ | ✓ | |
| Blog: write drafts | ✓ | ✓ | ✓ | ✓ |
| Media upload/organize | ✓ | ✓ | ✓ | ✓ |
| Widgets: custom widget composer | ✓ | ✓ | | |
| Icon sets install | ✓ | ✓ | | |

- **Page control**: MODERATOR/EDITOR see only pages granted via `PagePermission`
  (VIEW/EDIT/PUBLISH per page). Grant UI lives on the page's "Sharing" panel and on
  the user detail screen. `Page.locked` restricts a page to ADMIN+ regardless.
- **Audit log** (Studio → Settings → Audit): every mutation logged (§7 `AuditLog`),
  filterable by user/entity/date. SUPERADMIN-visible.
- **Invites**: users are invited by email (token link → set password). Deactivate
  instead of delete; sessions revoke on deactivation/role change.

---

## 17. Settings (Everything in the UI)

**Studio → Settings**, stored in the `Setting` key-value table, all editable without
deploys:

- **General**: site name, tagline, logo (light/dark), favicon, default language,
  timezone, date format.
- **Domains & URLs**: canonical base URL, www/trailing-slash policy.
- **Scripts & integrations**: head/body-start/body-end script slots (SUPERADMIN only,
  size-limited, rendered with `next/script` strategies), GA4/GTM/Meta Pixel ids as
  first-class fields, Crisp/Intercom chat id.
- **Forms**: where `contact-form`/`newsletter` submissions go (email via SMTP
  settings, webhook URL, or provider API key).
- **Storage**: S3 endpoint/bucket/keys (write-only display), CDN base URL.
- **Email (SMTP)**: for invites + form notifications, with "send test email".
- **Maintenance mode**: toggle + allowlist (renders a static maintenance page,
  Studio stays accessible).
- **Backups & export**: one-click JSON export of all content (pages, posts, theme,
  settings) and import on a fresh install; nightly `pg_dump` documented in DEPLOY.md.
- **Danger zone**: purge trash, flush caches (`revalidateTag` all), regenerate all
  pages.

Secrets set via UI are encrypted at rest (AES-256-GCM with `APP_SECRET`); env-provided
values win over DB values so ops can pin them.

---

## 18. Admin UI Design Language & Color System

The Studio gets its own identity, distinct from any site it manages (the site's theme
tokens from §11 apply only inside the canvas iframe, never to Studio chrome).

**Design language**: clean, dense-but-airy productivity UI. 8-px spacing grid,
`radius-lg` cards, subtle borders over shadows, Inter for UI text, mono for
slugs/paths. Every list has search, empty states illustrate the next action,
destructive buttons are always secondary-styled with confirm dialogs. Full dark mode.

**PagePilot Studio palette** (Tailwind v4 `@theme` tokens in `globals.css`):

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--pp-brand` | `#4F46E5` (indigo 600) | `#818CF8` | Primary actions, active nav, focus ring |
| `--pp-brand-soft` | `#EEF2FF` | `#312E81` | Selected rows, active chips |
| `--pp-ink` | `#0F172A` | `#F1F5F9` | Headings |
| `--pp-text` | `#334155` | `#CBD5E1` | Body |
| `--pp-text-muted` | `#64748B` | `#94A3B8` | Meta, timestamps |
| `--pp-bg` | `#F8FAFC` | `#0B1220` | App background |
| `--pp-surface` | `#FFFFFF` | `#111A2E` | Cards, panels, sidebar |
| `--pp-border` | `#E2E8F0` | `#1E293B` | Hairlines |
| `--pp-success` | `#16A34A` | `#4ADE80` | Published, saved |
| `--pp-warning` | `#D97706` | `#FBBF24` | Draft changes, schema drift |
| `--pp-danger` | `#DC2626` | `#F87171` | Destructive, errors |
| `--pp-info` | `#0284C7` | `#38BDF8` | Hints, scheduled |

Status colors are semantic and used consistently: green = published/live,
amber = draft/unsaved/attention, red = error/destructive, blue = informational.
Indigo (not the managed site's blue) keeps "the tool" visually separate from
"the product" while staying in a professional cool-toned family.

---

## 19. API Design

All Studio APIs under `/api/studio/*`; every handler: session → role/permission check
→ Zod-validate input → service call in `modules/` → typed JSON response
`{ data } | { error: { code, message } }`. Route handlers stay thin; logic lives in
services (testable without HTTP).

Core surface (indicative, extend as needed):

```
GET    /api/studio/widgets/manifest          # registry manifest (schemas + meta)
CRUD   /api/studio/widgets/custom            # custom widgets
CRUD   /api/studio/widgets/global            # global widgets (+ affected-pages list)

GET    /api/studio/pages?query=&status=      # paginated list
POST   /api/studio/pages                     # create (path uniqueness check)
GET    /api/studio/pages/:id                 # page + draft revision + seo
PATCH  /api/studio/pages/:id/draft           # autosave section tree (validated)
POST   /api/studio/pages/:id/publish         # snapshot + revalidateTag
POST   /api/studio/pages/:id/rollback        # point published at older revision
GET    /api/studio/pages/:id/revisions       # history

CRUD   /api/studio/blog/posts | categories | tags
POST   /api/studio/media/presign             # presigned upload URL
POST   /api/studio/media/commit              # register uploaded file (sharp pass)
CRUD   /api/studio/media | folders
CRUD   /api/studio/theme                     # + POST /:id/activate
CRUD   /api/studio/menus | redirects | icon-sets | users | permissions | settings
GET    /api/studio/audit
POST   /api/preview                          # draftMode cookie for canvas iframe
```

Rules: pagination on every list, cursor-based where large; rate-limit login and
presign endpoints; no `process.env` reads outside `config/app.config.ts`.

---

## 20. Developer Documentation Deliverable

The build is not done until `docs/` exists. Three documents, written for a developer
who has never seen the project:

1. **`docs/WIDGETS.md`** (most important): the widget contract end to end — folder
   anatomy, `schema.ts` with every `control` type demonstrated, registry registration,
   responsive envelope behavior, how the manifest reaches the Studio, schema-change
   migration flags, a full worked example (build a "Stats Row" widget from zero to
   visible-in-palette), testing checklist.
2. **`docs/DEVELOPER.md`**: architecture tour (this document condensed + "where do I
   look when X breaks"), folder map, data flow diagrams, conventions (RSC-first,
   modules/services split, comment policy), local setup (`pnpm install`,
   `docker compose up db`, `pnpm db:migrate`, `pnpm db:seed`, `pnpm dev`), how
   caching/revalidation tags work, how to add an API endpoint, how to add a role
   capability.
3. **`docs/DEPLOY.md`**: env vars (§23), migration strategy on deploy
   (`prisma migrate deploy` in build), storage/CDN setup, backup & restore, the
   scheduled-post cron, upgrade notes.

Also: seed script creates a superadmin (from env), the default theme, the starter
icon set, and one demo page using every starter widget, so a fresh install is
explorable in minutes.

---

## 21. Build Phases & Acceptance Criteria

Build in this order; each phase is shippable and testable.

**Phase 1 — Foundation.** Project scaffold (pnpm, TS strict, Tailwind v4, shadcn),
Prisma schema + migrations + seed, Auth.js with roles, Studio shell (sidebar, dark
mode, command palette stub), settings framework.
*Accept:* login as seeded superadmin, see dashboard, create a user, audit log rows appear.

**Phase 2 — Widget system + renderer.** Widget contract (`field`/`widgetMeta`
helpers, registry, manifest route), 8 primitive widgets, public catch-all renderer
with tag caching, draft-mode preview route.
*Accept:* a page hand-inserted in DB renders statically; invalid props render nothing
in prod and a red placeholder in preview.

**Phase 3 — Page builder.** Three-panel builder, dnd-kit drag/reorder, schema-driven
inspector (all control types), autosave draft revisions, publish + revalidate,
undo/redo, responsive toggle + envelope, revision history + rollback.
*Accept:* create `/test` from blank, compose 6 sections, publish, page is live and
static; edit → publish → change visible in < 5 s; rollback works.

**Phase 4 — Media + theme.** Media library complete (presigned upload, folders,
focal point, alt enforcement, trash), theme manager complete (tokens → CSS variables,
contrast checker, activate/rollback).
*Accept:* change primary color in UI → whole site repaints without rebuild;
publish blocked when a visible image lacks alt.

**Phase 5 — Blog + SEO.** TipTap editor with slash commands, workflow + scheduling,
blog public routes + RSS; full SEO panels, previews, sitemap/robots, redirects
manager, JSON-LD builders.
*Accept:* schedule a post and see it auto-publish; SERP/OG previews match output;
renamed path auto-offers a redirect; sitemap validates.

**Phase 6 — Marketing widget library + global/custom widgets + icons.** Remaining
starter widgets, global widget promote/detach with multi-page revalidation, custom
widget composer with exposed props, Iconify set installer + picker + server-side SVG
inlining.
*Accept:* build a full landing page (hero → features → testimonials → pricing → FAQ →
CTA) entirely in UI in under 30 minutes; install Tabler set and use an icon without
deploy.

**Phase 7 — Hardening + docs.** Rate limiting, encrypted settings, export/import,
maintenance mode, Lighthouse CI budget wired, all three docs written, seed demo
content.
*Accept:* Lighthouse ≥ 95 perf on demo page; fresh-clone-to-running < 10 minutes
following DEVELOPER.md alone.

---

## 22. Guardrails for the Implementing Agent

- **pnpm only.** Add `"preinstall": "npx only-allow pnpm"`. Never emit `npm`/`yarn`
  commands, including in docs.
- **Tailwind v4**: CSS-first config in `globals.css`; do not create
  `tailwind.config.js`. Gradients use `bg-linear-to-r`.
- **RSC by default**; `"use client"` only at interactive leaves. No CMS/builder code
  reachable from `(site)` routes; verify with the bundle analyzer.
- **One component per concern** — never a 500-line screen file. Builder panels,
  media grid, inspector controls: each its own folder of small components.
- **No `process.env` outside `config/app.config.ts`.**
- **Validate at every trust boundary**: API input (Zod), widget props on save AND on
  render, uploaded file types/sizes, sanitized `html-embed`.
- **Never trust client role claims** — re-check permissions server-side in every
  handler and server action.
- **Migrations, not `db push`,** for anything beyond first scaffold; on large tables
  create indexes `CONCURRENTLY` outside the migration transaction in production.
- **Soft-delete content, hard-guard cascades**; every destructive UI action has a
  confirm with the entity's name typed or clearly shown.
- **Accessibility**: dnd-kit keyboard paths, focus-visible rings, dialog focus traps,
  WCAG AA in both Studio themes.
- **Comments explain why, not what**; no banner comments, no dead code.
- **No em dash in any copy** the platform seeds or ships as defaults; rewrite with a
  comma or two sentences.
- When unsure about a Next.js API, read the local docs in
  `node_modules/next/dist/docs/` for the installed version before writing code.

---

## 23. Environment Variables

All read once in `src/config/app.config.ts` into a typed `APP` object.

```bash
# Core
DATABASE_URL=postgresql://user:pass@localhost:5432/pagepilot
APP_URL=https://example.com            # canonical base URL (also used by seo)
APP_SECRET=<32+ random bytes>          # settings encryption + misc signing
AUTH_SECRET=<32+ random bytes>         # Auth.js
REVALIDATE_KEY=<random>                # guards /api/revalidate

# Seed
SEED_SUPERADMIN_EMAIL=admin@example.com
SEED_SUPERADMIN_PASSWORD=<set on first run, forced change at first login>

# Storage (S3-compatible: AWS S3, Cloudflare R2, MinIO)
S3_ENDPOINT=
S3_REGION=auto
S3_BUCKET=pagepilot-media
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
CDN_BASE_URL=                          # public URL prefix for media

# Optional
SMTP_HOST= SMTP_PORT= SMTP_USER= SMTP_PASS= SMTP_FROM=
GOOGLE_CLIENT_ID= GOOGLE_CLIENT_SECRET=   # optional OAuth login
```

---

*End of specification. Build order is §21; when any instruction here conflicts with
implementation convenience, §3 (Guiding Principles) wins.*
