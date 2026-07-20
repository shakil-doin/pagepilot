# AGENT.md — rules for AI coding agents working on PagePilot

Read this before touching code. Deep reference: `docs/DEVELOPER.md`
(architecture, API surface, gotchas), `docs/WIDGETS.md` (widget contract),
`PROCESS.md` (step-by-step recipes for common tasks).

## What this repo is

A section-driven CMS in one Next.js 16 project: public site (`src/app/(site)`,
static RSC), admin Studio (`src/app/studio`, client-heavy), API
(`src/app/api`, thin handlers). PostgreSQL via Prisma 7, media via ImageKit,
pages stored as JSON trees of widget instances validated by Zod schemas.

## Hard rules (non-negotiable)

1. **pnpm only.** Never emit `npm` or `yarn` commands, including in docs.
2. **No `process.env` outside `src/config/app.config.ts`.** Import `APP`.
3. **RSC by default.** `"use client"` only at interactive leaf components.
   Nothing under `src/components/studio`, TipTap, dnd-kit, react-query,
   recharts or @phosphor-icons may ever be imported from `(site)` routes or
   `src/components/site` / `src/widgets` server files.
4. **Server logic in `src/modules/`** (files start with `import "server-only"`),
   client fetchers in `src/services/`, shared types in `src/types/`.
5. **Validate every trust boundary.** Zod-parse all API input. Widget props
   validate at save AND render. Never trust client role claims; every
   `/api/studio` handler starts with `requireSession` / `requireCapability` /
   `requirePageAccess` from `src/modules/auth/rbac.ts` and wraps in `handleApi`.
6. **Cache expiry goes through `expireTag()`** from `src/lib/cache.ts`.
   Never call `revalidateTag` directly (Next 16 two-arg semantics are wrapped
   there). When a mutation changes public content, expire the matching tags
   (table in docs/DEVELOPER.md §10) inside the service, not the route.
7. **Migrations, never `prisma db push`.** Schema change = edit
   `prisma/schema.prisma` + `pnpm db:migrate` + regenerate.
8. **Soft-delete content.** Media goes to trash before purge; users are
   deactivated, not deleted; pages keep revisions. Destructive UI actions use
   `ConfirmDialog` with the entity named.
9. **Audit every mutation**: call `audit(userId, "domain.action", "Entity:id", detail?)`.
10. **Design tokens only.** Studio components use the Tailwind-mapped tokens
    (`bg-app`, `bg-surface`, `text-ink`, `text-body`, `text-muted`,
    `border-hairline`, `text-brand`, status colors) — never raw hex, never
    `dark:` variants (dark mode is CSS-var flipping via `.dark`). Site
    widgets use `var(--pp-*)` and `pp-*` helper classes only.
11. **Comments explain why, never what.** No banner comments, no dead code.
12. **No em dashes in user-facing copy** the platform seeds or ships.

## Conventions

- Kebab-case filenames. Arrow-function components, default export, `Props`
  type. One component per concern: screens are folders of small components,
  never a 500-line file.
- `cn()` from `src/lib/utils.ts` for class merging.
- Studio data fetching: react-query with a stable key per resource
  (`["pages"]`, `["media", view, kind, query]`, ...), invalidate on mutation,
  `sonner` toasts for success/error. Fetches go through `api.*` from
  `src/services/api.ts` (throws `ApiClientError` with code/message).
- API envelope: `{ data }` on success, `{ error: { code, message } }` on
  failure. Route params are Promises in Next 16:
  `type Params = { params: Promise<{ id: string }> }`.
- `useSearchParams` consumers must sit inside `<Suspense>`.
- Zod 4: `z.record(z.string(), z.unknown())` (two args); editor annotations
  attach via `field(schema, { control, label, ... })` from `src/widgets/lib.ts`.

## Version traps (will bite you if ignored)

- Prisma 7: datasource url lives in `prisma.config.ts`, not the schema;
  client needs `@prisma/adapter-pg`; import from `@/generated/prisma/client`.
- Next 16: `src/proxy.ts` replaces middleware; `robots.ts` must be at
  `src/app/robots.ts` (404s inside route groups); `draftMode()`/`params` are
  async.
- TypeScript is pinned to 5.9.x — do not upgrade to 7 (typescript-eslint breaks).
- TipTap v3: `immediatelyRender: false` always; StarterKit bundles Link.
- Auth.js v5 beta: `trustHost: true` is set and required.

## Verification gates (run before claiming done)

```bash
pnpm typecheck   # must be 0 errors
pnpm lint        # must be 0 errors (warnings tolerated)
pnpm build       # must pass; check /[[...slug]] stays ● (SSG)
```

Functional smoke (dev server + seeded DB): login `admin@example.com` /
seed password → create page → add sections → publish → curl the path →
content present. Media: upload → commit → trash → purge. If you touched
caching: publish twice, second change must be visible immediately.

## Where things live (quick index)

| Need | File |
| --- | --- |
| Add a widget | `docs/WIDGETS.md` + `src/widgets/registry.ts` |
| Capability matrix | `src/modules/auth/permissions.ts` |
| API guards + error envelope | `src/modules/auth/rbac.ts` |
| Cache tags | `src/lib/cache.ts` |
| Page publish/draft/rollback | `src/modules/pages/page.service.ts` |
| Publish validation + alt enforcement | `src/modules/pages/validate.service.ts` |
| Section rendering (incl. responsive envelope) | `src/components/site/section-renderer.tsx` |
| Builder state (autosave, undo, publish) | `src/components/studio/builder/use-builder.ts` |
| Inspector control dispatch | `src/components/studio/builder/inspector/field-control.tsx` |
| ImageKit upload/delete | `src/modules/media/storage.service.ts` |
| Theme tokens → CSS | `src/modules/theme/theme.service.ts` |
| TipTap JSON → HTML | `src/modules/blog/blog.service.ts` |
| Settings keys + encryption | `src/modules/settings/settings.service.ts` |
| Redirects in request path | `src/proxy.ts` + `/api/redirects-map` |

## Scope discipline

- Prefer the smallest change that satisfies the request; follow existing
  patterns in the nearest sibling file.
- A new feature = service in `modules/` + route in `api/studio/` + screen
  component folder + react-query wiring. See PROCESS.md for exact steps.
- Do not refactor unrelated code, do not add dependencies without need, do
  not change `prisma/schema.prisma` casually (it requires a migration and a
  regenerate).
