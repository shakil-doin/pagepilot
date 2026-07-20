# PagePilot Developer Guide

The complete reference for developing and maintaining PagePilot: a
section-driven, performance-first CMS in one Next.js project. Companion docs:
[WIDGETS.md](WIDGETS.md) (widget authoring, the only code developers write
day to day) and [DEPLOY.md](DEPLOY.md) (infra, env, backups). AI-agent
guidance lives in the repo root: `AGENT.md` (rules) and `PROCESS.md`
(step-by-step recipes).

---

## 1. What PagePilot is

One Next.js app, three faces:

| Face | Route space | Nature |
| --- | --- | --- |
| **Engine** (public site) | `/`, `/blog`, any published path | Static RSC pages, tag-based ISR, zero CMS JavaScript |
| **Studio** (admin) | `/studio/**`, `/login` | Client-heavy React app behind Auth.js |
| **API** | `/api/**` | Thin route handlers → server services, Zod-validated, RBAC-checked |

Content lives in PostgreSQL through Prisma. Media lives in ImageKit (local
disk fallback in dev). Pages are ordered JSON trees of **widget** instances;
widgets are the only thing developers write.

### The core loop

1. Developer writes a widget (RSC component + Zod schema) and registers it:
   one line in `src/widgets/registry.ts`.
2. `src/widgets/manifest.ts` serializes every schema to JSON Schema (with
   editor annotations embedded) and serves it at
   `GET /api/studio/widgets/manifest`. The Studio builds inspector forms from
   this manifest and **never imports widget components**.
3. Editors compose pages in the builder. Autosave writes the section tree
   into a rolling draft `PageRevision`.
4. **Publish** validates the tree against every widget schema (plus alt-text
   enforcement), freezes the revision, points `Page.publishedRevisionId` at
   it, and expires the page's cache tag. Live in about a second.
5. The public catch-all `src/app/(site)/[[...slug]]/page.tsx` loads the
   published revision and renders pure RSC through
   `src/components/site/section-renderer.tsx`.

---

## 2. Tech stack (installed versions)

| Concern | Package | Version |
| --- | --- | --- |
| Framework | `next` (App Router, RSC, Turbopack) | 16.2.x |
| Runtime UI | `react` / `react-dom` | 19.2.x |
| Language | `typescript` (strict) | 5.9.x (pinned; TS 7 breaks typescript-eslint) |
| Database | PostgreSQL | 16+ |
| ORM | `prisma` + `@prisma/client` + `@prisma/adapter-pg` | 7.8.x (driver-adapter mode, config in `prisma.config.ts`) |
| Styling | `tailwindcss` v4 CSS-first + `@tailwindcss/postcss` | 4.x (no `tailwind.config.js`) |
| Studio UI kit | hand-rolled shadcn-style primitives on Radix | `src/components/ui/*` |
| Auth | `next-auth` v5 beta + `@auth/prisma-adapter` + `bcryptjs` | JWT sessions, role in token |
| Validation | `zod` | 4.x (native `z.toJSONSchema`) |
| Rich text | `@tiptap/*` v3 (StarterKit bundles Link) | blog editor + richtext control |
| Drag & drop | `@dnd-kit/core` + `sortable` | layers panel |
| Data fetching (Studio) | `@tanstack/react-query` v5 | invalidation per resource key |
| Media processing | `sharp` (dims + LQIP), ImageKit REST (no SDK) | |
| Sanitizing | `sanitize-html` | rich text + html-embed |
| Email | `nodemailer` | invites + form notifications |
| Icons (Studio) | `@phosphor-icons/react` | site icons are DB-stored Iconify sets |
| Toasts / palette / charts | `sonner` / `cmdk` / `recharts` | |
| Package manager | **pnpm only** (`preinstall: npx only-allow pnpm`) | |

---

## 3. Local setup

```bash
pnpm install
cp .env.example .env         # fill DATABASE_URL + secrets (see §8)
pnpm db:migrate
pnpm db:seed                 # superadmin, theme, menus, demo page, Phosphor icons
pnpm dev
```

Sign in at `/login` with `SEED_SUPERADMIN_EMAIL` / `SEED_SUPERADMIN_PASSWORD`.
Studio at `/studio`, seeded demo page at `/`.

Notes for this machine's setup:

- Any Postgres 16+ works. A user-local cluster (initdb, custom port) is fine;
  point `DATABASE_URL` at it.
- Without ImageKit keys, uploads fall back to local disk under
  `public/uploads/` (dev only).
- If port 3000 is busy, `next dev` auto-bumps to 3001; production uses
  `PORT=3001 pnpm start`.

### Scripts

| Command | What |
| --- | --- |
| `pnpm dev` | dev server (Turbopack) |
| `pnpm build` / `pnpm start` | production build / serve |
| `pnpm typecheck` | strict TS across the repo (must stay at 0 errors) |
| `pnpm lint` | ESLint 9 flat config (`eslint.config.mjs`) |
| `pnpm db:migrate` | create/apply dev migrations |
| `pnpm db:deploy` | apply migrations (CI/production) |
| `pnpm db:seed` | idempotent seed (`prisma/seed.ts`, runs via tsx) |
| `pnpm db:generate` | regenerate Prisma client into `src/generated/prisma` |
| `pnpm db:studio` | Prisma Studio |

---

## 4. Folder map

```
pagepilot/
├── prisma/
│   ├── schema.prisma            # full schema (§5); no url in datasource (Prisma 7)
│   ├── migrations/
│   └── seed.ts                  # standalone (no @/ imports, no server-only)
├── prisma.config.ts             # Prisma 7 config: datasource url, seed cmd
├── docs/                        # WIDGETS.md, DEVELOPER.md, DEPLOY.md
├── AGENT.md                     # rules for AI coding agents
├── PROCESS.md                   # step-by-step recipes for common changes
├── public/uploads/              # dev-only local media fallback (gitignored content)
├── src/
│   ├── app/
│   │   ├── layout.tsx           # root html/body + globals.css only
│   │   ├── globals.css          # Tailwind v4 @theme + Studio palette + TipTap css
│   │   ├── robots.ts            # must live at app root (404s inside a group)
│   │   ├── (site)/              # PUBLIC SITE, RSC only
│   │   │   ├── layout.tsx       # theme <style> injection, fonts, scripts, maintenance
│   │   │   ├── site.css         # .pp-* site classes + responsive helpers
│   │   │   ├── [[...slug]]/page.tsx  # catch-all renderer (SSG + draftMode branch)
│   │   │   ├── blog/            # index, [slug], rss.xml/route.ts
│   │   │   └── sitemap.ts
│   │   ├── (auth)/login/        # login + set-password (invite flow)
│   │   ├── studio/              # Studio screens; layout.tsx = auth guard + shell
│   │   │   └── {pages,blog,media,theme,icons,users,settings,navigation,widgets,seo}/
│   │   └── api/
│   │       ├── auth/[...nextauth]/
│   │       ├── studio/          # RBAC-guarded CMS API (§7)
│   │       ├── preview/         # enables draftMode, redirects to path
│   │       ├── revalidate/      # key-guarded external tag expiry
│   │       ├── redirects-map/   # consumed by proxy.ts
│   │       ├── forms/           # public contact/newsletter endpoint
│   │       ├── invite/accept/   # set password from invite token
│   │       └── cron/scheduled-posts/
│   ├── proxy.ts                 # Next 16 replacement for middleware: redirects, slashes
│   ├── widgets/                 # ★ developer territory (see docs/WIDGETS.md)
│   │   ├── lib.ts               # field(), widgetMeta(), mediaRef, linkRef, buttonItem
│   │   ├── registry.ts          # type → { component, schema, meta }
│   │   ├── manifest.ts          # registry → JSON Schema manifest (+ hash + defaults)
│   │   └── <widget>/            # index.tsx + schema.ts (+ client leaf files)
│   ├── components/
│   │   ├── ui/                  # shadcn-style primitives (Radix + cva)
│   │   ├── site/                # Section, Container, SiteImage/Icon/Button,
│   │   │                        # site-header/footer, section-renderer, rich-html
│   │   └── studio/              # one folder per concern:
│   │       ├── shell/           # sidebar, topbar, command palette
│   │       ├── builder/         # toolbar, palette, layers, canvas, inspector/,
│   │       │                    # use-builder.ts (state), builder-utils.ts (tree ops)
│   │       ├── pages/ media/ blog/ theme/ seo/ icons/ users/ settings/
│   │       ├── navigation/ widgets/ auth/ shared/
│   ├── modules/                 # SERVER-ONLY domain services ("server-only" import)
│   │   ├── auth/                # index.ts (NextAuth), permissions.ts (matrix),
│   │   │                        # rbac.ts (guards + handleApi), audit.service.ts
│   │   ├── pages/               # page.service.ts, validate.service.ts
│   │   ├── blog/                # blog.service.ts (incl. tiptapToHtml)
│   │   ├── media/               # media.service.ts, storage.service.ts (ImageKit)
│   │   ├── theme/ seo/ icons/ users/ settings/ widgets/
│   ├── services/                # CLIENT-side callers: api.ts (fetch envelope),
│   │                            # media.ts (upload pipeline)
│   ├── providers/               # studio-providers.tsx (query, theme, toaster)
│   ├── types/                   # index.ts (SectionNode, ThemeTokens, …), next-auth.d.ts
│   ├── lib/                     # db.ts, cache.ts (TAGS + expireTag), utils.ts (cn),
│   │                            # sanitize.ts, fonts.ts, mailer.ts, rate-limit.ts
│   ├── config/app.config.ts     # the ONLY file that reads process.env
│   └── generated/prisma/        # generated client (gitignored)
├── eslint.config.mjs            # flat config, eslint-config-next native imports
└── next.config.ts
```

---

## 5. Database schema (summary)

Full source of truth: `prisma/schema.prisma`.

| Model | Purpose | Key fields / notes |
| --- | --- | --- |
| `User` | Studio accounts | `role` (SUPERADMIN/ADMIN/MODERATOR/EDITOR), `status`, `passwordHash` |
| `Account`, `Session`, `VerificationToken` | Auth.js standard + invite tokens | invites reuse VerificationToken |
| `PagePermission` | per-page grants for MODERATOR/EDITOR | `access`: VIEW/EDIT/PUBLISH; ADMIN+ bypasses |
| `AuditLog` | every Studio mutation | `action`, `entity`, `detail` JSON |
| `Page` | one URL | unique `path` (leading slash, no trailing), `publishedRevisionId`, `hideHeader/Footer`, `locked` |
| `PageRevision` | immutable snapshots + rolling draft | `sections` JSON (SectionNode[]), `version` unique per page |
| `Seo` | one row per page OR post | meta/OG/twitter/JSON-LD/sitemap flags, `ogImageId → Media` |
| `Redirect` | path redirects | `fromPath` unique, `permanent` (308/307), applied in `proxy.ts` |
| `Post` | blog | TipTap JSON `content` + pre-rendered `contentHtml`, status DRAFT/SCHEDULED/PUBLISHED/ARCHIVED |
| `Category`, `Tag` | taxonomy | m2m with Post |
| `MediaFolder` | nested folders | self-relation |
| `Media` | one asset | `storageKey` = **ImageKit fileId** (or `media/...` local key), `url`, dims, `alt`, focal point, `blurDataUrl`, `deletedAt` (trash) |
| `Theme` | versioned token sets | `tokens` JSON (§6), one `active` |
| `Menu` | nav per slot | `slot` unique ("header"/"footer"), `items` JSON tree |
| `GlobalWidget` | shared widget instance | referenced from pages as `{type:"global", globalId}` |
| `CustomWidget` | Studio-composed tree of primitives | `tree` + `exposedProps` |
| `IconSet` | installed Iconify collection | `prefix` unique, `data` = full collection JSON |
| `Setting` | key-value settings | keys in §9; `storage`/`email` values encrypted |

### SectionNode (the page JSON)

```jsonc
{
  "id": "sec_x1",
  "type": "feature-grid",           // registry key | "global" | "custom:<id>"
  "props": { ... },                  // validated by the widget's Zod schema
  "globalId": "...",                // when type === "global"
  "adminLabel": "Summer promo",     // layers-panel name
  "hidden": false,
  "spacing": { "top": "lg", "bottom": "md" },      // none|sm|md|lg → theme scale
  "responsive": {
    "hideOn": ["mobile"],
    "overrides": { "mobile": { "columns": 1 } }    // only props annotated responsive:true
  },
  "children": [[ ...SectionNode ]]  // container widgets (columns): one array per slot
}
```

---

## 6. Theming

- Tokens stored in `Theme.tokens`: `colors` (name → {value,label}),
  `gradients`, `typography` (fonts from the curated list in `src/lib/fonts.ts`,
  scale, weight), `radii`, `spacing` (section scale), `container`, `buttons`
  (variant → bg/text/border/radius/shadow).
- `modules/theme/theme.service.ts#tokensToCss` emits one inline `<style>`
  block in the site layout: `--pp-c-<color>`, `--pp-radius-*`, `--pp-space-*`,
  `--pp-text-*`, `--pp-gradient-*`, plus `.pp-btn-<variant>` rules. Cached
  under the `theme` tag; saving the active theme repaints the whole site with
  no rebuild.
- Widgets consume only `var(--pp-*)` and the helper classes in
  `src/app/(site)/site.css` (`pp-heading`, `pp-muted`, `pp-on-dark`,
  `pp-bg-surface`, breakpoint helpers `pp-hide-*`/`pp-only-*`).
- **Studio chrome is separate**: its palette lives in `globals.css` as
  `--pp-brand/--pp-ink/...` mapped to Tailwind color utilities (`bg-surface`,
  `text-ink`, `border-hairline`, ...). Dark mode = `.dark` class on `<html>`,
  toggled in `studio-providers.tsx`. Site theme never leaks into Studio and
  vice versa.

---

## 7. API design

Envelope: success `{ data }`, failure `{ error: { code, message } }`. Every
`/api/studio/*` handler is:

```
session (requireSession / requireCapability / requirePageAccess)
  → Zod-parse input
  → service call in modules/
  → handleApi wraps result / errors
```

`modules/auth/rbac.ts` exports the guards and `handleApi`; `ApiAuthError`
maps to specific HTTP statuses. Capability names live in
`modules/auth/permissions.ts` (single source of truth, also used by the
sidebar and screens via `can(role, capability)`).

Surface (all under `/api/studio` unless noted):

```
GET    widgets/manifest                 { manifest, customWidgets, globalWidgets }
CRUD   widgets/global(/:id)             affected-pages list on GET/PATCH
CRUD   widgets/custom(/:id)
GET/POST pages                          list (query/status/page) | create
GET/PATCH/DELETE pages/:id              meta (title/path/flags) | archive | delete
PATCH  pages/:id/draft                  autosave sections (+ blockers[])
POST   pages/:id/publish                strict validation; 422 BLOCKED with blockers
POST   pages/:id/rollback               { revisionId }
GET    pages/:id/revisions
PUT    pages/:id/seo | pages/:id/permissions
CRUD   blog/posts(/:id) + publish/schedule/unpublish + seo; categories; tags
GET    media                            cursor pagination; POST media/presign
POST   media/upload-local               dev fallback multipart
POST   media/commit                     registers upload (ImageKit verify + sharp)
GET/PATCH/DELETE media/:id              ?purge=1 = delete forever (propagates to ImageKit)
POST   media/restore                    { ids }
CRUD   media/folders
GET/POST theme; PATCH/DELETE theme/:id; POST theme/:id/activate
GET/PUT menus                           { slot, items }
GET/POST/PUT redirects; DELETE redirects/:id      PUT = CSV import
GET/POST icon-sets; DELETE icon-sets/:prefix; GET icons/search; GET icons/catalog
GET/POST users; GET/PATCH/PUT users/:id           PUT = page grants
GET/PUT settings/:key                   key ∈ SETTING_KEYS
GET    audit                            filterable, paginated
GET    export                           full content JSON dump
POST   danger                           { action: "flush-cache" | "purge-trash" }

Outside /studio:
GET    /api/preview?path=               enables draftMode (session required)
POST   /api/revalidate                  key-guarded { tags: [] }
GET    /api/redirects-map               cached map for proxy.ts
POST   /api/forms                       public; rate-limited; audit + webhook + email
POST   /api/invite/accept               { email, token, password }
GET    /api/cron/scheduled-posts?key=   flips due SCHEDULED → PUBLISHED
```

Client side: `src/services/api.ts` is the only fetch wrapper
(`api.get/post/patch/put/del`, throws `ApiClientError`); screens use
react-query with per-resource keys and invalidate on mutation.

---

## 8. Environment variables

Read once in `src/config/app.config.ts` into typed `APP`; `process.env` is
banned everywhere else (ESLint-able, convention-enforced).

| Var | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | Postgres connection (also used by Prisma CLI via `prisma.config.ts`) |
| `APP_URL` | prod | canonical origin (SEO canonicals, invite links) |
| `APP_SECRET` | yes | AES-256-GCM key for encrypted settings + misc signing |
| `AUTH_SECRET` | yes | Auth.js JWT signing/encryption |
| `REVALIDATE_KEY` | prod | guards `/api/revalidate` + `/api/cron/*` |
| `SEED_SUPERADMIN_EMAIL/_PASSWORD` | first seed | initial superadmin |
| `IMAGEKIT_PUBLIC_KEY/_PRIVATE_KEY/_URL_ENDPOINT/_FOLDER` | prod media | ImageKit storage; unset = local-disk dev fallback |
| `SMTP_*` | optional | invites + form notifications (UI settings can also hold these; env wins) |
| `GOOGLE_CLIENT_ID/_SECRET` | optional | Google OAuth login |

Generate secrets:
`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.

---

## 9. Settings keys

`Setting` table, all edited in Studio → Settings, read via
`settings.service.ts` (`getSetting`, `getSettingCached`, `setSetting`):

| Key | Shape | Notes |
| --- | --- | --- |
| `site.general` | siteName, tagline, logoUrl, faviconUrl, language, timezone | readable by any session |
| `site.urls` | canonicalBaseUrl, www/trailing-slash policy | informational |
| `seo.defaults` | titleTemplate, defaults, verification, org JSON-LD, robotsTxt | used by metadata + sitemap + robots |
| `scripts` | ga4Id, gtmId, head/bodyStart/bodyEnd | injected in site layout; 20k char cap |
| `forms` | notifyEmail, webhookUrl | contact/newsletter routing |
| `storage` | ImageKit keys (encrypted) | env values win |
| `email` | SMTP (encrypted) | env values win |
| `maintenance` | enabled, message | site renders maintenance page; Studio stays up |

---

## 10. Caching and revalidation

All cached reads go through `cached()` in `src/lib/cache.ts`
(`unstable_cache` + tags). `expireTag()` wraps Next 16's
`revalidateTag(tag, { expire: 0 })` so changes are visible on the very next
request (the default two-arg "max" profile would serve stale-first).

| Tag | Expired by |
| --- | --- |
| `page:<path>` | publish / rollback / rename / delete of that page |
| `pages` | any page publish/archive/delete (sitemap + static params) |
| `theme` | saving or activating the active theme |
| `menu` | saving a menu |
| `settings` | saving any setting |
| `global-widgets`, `global-widget:<id>` | global widget edits (+ every page using it, via `findPagesUsingGlobal`) |
| `custom-widgets` | custom widget edits |
| `post:<slug>`, `blog-index` | blog publish/unpublish/edit/delete |
| `redirects` | redirect CRUD (proxy refetches its map within ~15 s) |
| `icons` | icon set install/uninstall |

Draft mode (`/api/preview`) is the only dynamic path; production visitors
always hit the static shell. The builder canvas is an iframe of the real
renderer in draft mode; the renderer stamps `data-pp-section` ids only there.

---

## 11. Auth, roles, permissions

- Auth.js v5: credentials (bcrypt) + optional Google; JWT strategy; `role`
  and `status` ride in the token (`src/types/next-auth.d.ts` augments types).
  `trustHost: true` is required behind proxies.
- Guard layers (defense in depth): `app/studio/layout.tsx` redirects
  non-sessions; every API handler re-checks with `requireSession` /
  `requireCapability` / `requirePageAccess`.
- Capability matrix (`modules/auth/permissions.ts`):

| Capability | SUPERADMIN | ADMIN | MODERATOR | EDITOR |
| --- | --- | --- | --- | --- |
| users.manage, settings.manage, audit.view | ✓ | | | |
| theme/navigation/seo manage, pages.manage, widgets.custom/global, icons.install | ✓ | ✓ | | |
| pages.edit.granted | ✓ | ✓ | ✓ | ✓ |
| pages.publish.granted, blog.publish | ✓ | ✓ | ✓ | |
| blog.draft, media.manage | ✓ | ✓ | ✓ | ✓ |

- MODERATOR/EDITOR see only granted pages (`PagePermission`), EDITOR can
  never publish even with a PUBLISH grant, `Page.locked` restricts to ADMIN+.
- Invites: `inviteUser` creates the user + `VerificationToken`, emails a
  set-password link (`/login/set-password`); the link is also returned for
  manual sharing when SMTP is off. Deactivation/role change deletes sessions.
- Every mutation logs to `AuditLog` via `audit()` (fire-and-forget).

---

## 12. Media pipeline (ImageKit)

Upload: client asks `POST media/presign` → server returns HMAC-signed auth
params (private key stays server-side) → browser POSTs the file straight to
ImageKit → client calls `POST media/commit` with the returned `fileId` →
server **verifies the fileId against ImageKit's details API** (never trusts
client URL/dims), runs sharp for the LQIP blur placeholder, creates the
`Media` row with `storageKey = fileId`.

Delete: trash is a soft delete (`deletedAt`, restorable, asset stays in
ImageKit). Permanent delete (`?purge=1`, danger-zone purge, 30-day purge)
calls `deleteObject()` → `DELETE api.imagekit.io/v1/files/{fileId}`.

Dev fallback (no ImageKit env): presign returns `mode:"local"`, upload goes
through `media/upload-local` (path-traversal-guarded), files land in
`public/uploads/media/...`, purge unlinks from disk. Keys starting with
`media/` are local; anything else is treated as an ImageKit fileId.

Alt enforcement: `validate.service.ts` walks published trees; any visible
IMAGE mediaRef without alt text blocks publish (422 with per-section
blockers). Media picked in the builder is stored as a **snapshot object**
(`mediaRef` in `widgets/lib.ts`) so rendering costs zero queries.

---

## 13. Blog pipeline

TipTap JSON is the source of truth (`Post.content`). On publish,
`tiptapToHtml` (hand-rolled walker + `sanitize-html`) pre-renders
`contentHtml` and computes `readingMins`, so public reads never parse
ProseMirror JSON. Scheduled posts: status SCHEDULED + `scheduledFor`; the
cron route flips due posts and expires blog tags. RSS at `/blog/rss.xml`,
`BlogPosting` JSON-LD on post pages.

---

## 14. Icons

Iconify collections are downloaded once (server-side) into the `IconSet`
table; after that everything is DB-served: the Studio picker searches
`icons/search`, and `SiteIcon` (async RSC) inlines SVG at render time. Zero
icon JavaScript ships to visitors. Phosphor is seeded. Catalog browsing
proxies `api.iconify.design` (needs network at install time only).

---

## 15. Gotchas and platform quirks (read before debugging)

- **Prisma 7**: no `url` in `schema.prisma` (lives in `prisma.config.ts`);
  client requires `@prisma/adapter-pg`; generated client imports from
  `@/generated/prisma/client`; package.json `prisma.seed` is ignored in favor
  of `prisma.config.ts`.
- **Next 16**: `middleware.ts` is deprecated → `src/proxy.ts` (exports
  `proxy` + `config.matcher`). `revalidateTag` needs the two-arg form;
  use `expireTag()` from `lib/cache.ts`, never call `revalidateTag` directly.
  `params`/`searchParams` are Promises. `robots.ts` 404s inside a route
  group; it lives at `src/app/robots.ts`.
- **TypeScript pinned to 5.9**: TS 7 breaks `@typescript-eslint`.
- **ESLint 9 flat config**: import `eslint-config-next/core-web-vitals`
  directly (FlatCompat crashes). `react-hooks/set-state-in-effect` and
  `react-hooks/refs` are downgraded to warnings (Studio forms intentionally
  hydrate fetched data into local state).
- **Auth.js**: `trustHost: true` required in production; `useSearchParams`
  consumers need a `<Suspense>` boundary.
- **TipTap v3**: `immediatelyRender: false` is mandatory in SSR; StarterKit
  already bundles Link (configure, don't re-add).
- **nodemailer 9** triggers a harmless peer warning from next-auth (wants 7);
  we use it directly, not through Auth.js.
- **JS budget**: the framework baseline (React 19 + Next runtime) is ~200 KB
  gzipped on public pages. What matters and is enforced by design: no
  TipTap/dnd-kit/react-query/recharts/Phosphor in the public bundle (the
  Studio never shares client components with `(site)`).

## 16. Where do I look when X breaks?

| Symptom | Look at |
| --- | --- |
| Section renders nothing | schema validation failed; open the builder (red placeholder + blockers) |
| Publish not visible on site | the service should call `expireTag` (`lib/cache.ts` tags table) |
| Inspector form wrong for a field | `field()` annotation; `inspector/schema-utils.ts` JSON-Schema→control resolution |
| Preview iframe blank | `/api/preview` needs a Studio session; draftMode cookie |
| Redirect not firing | `src/proxy.ts` matcher (skips `/api`, `/studio`); `/api/redirects-map` |
| Upload fails | ImageKit env vars; local fallback writes `public/uploads` |
| Site fonts wrong | `lib/fonts.ts` curated names must match theme typography values |
| Scheduled post stuck | cron must hit `/api/cron/scheduled-posts?key=REVALIDATE_KEY` |
| 401/403 from Studio API | capability matrix vs the route's guard; page grants for MOD/EDITOR |
