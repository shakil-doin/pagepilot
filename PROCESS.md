# PROCESS.md — step-by-step recipes for changing PagePilot

Companion to `AGENT.md` (rules) and `docs/DEVELOPER.md` (reference). Each
recipe lists the exact files to touch, in order, plus the verification step.
Follow the nearest existing sibling as the style template.

---

## 1. Add a widget (the most common task)

1. Create `src/widgets/<key>/schema.ts`: `meta = widgetMeta({ key, name, category, description })`
   and `schema = z.object({...})` with every field wrapped in
   `field(zodType, { control, label, ... })`. Every field needs a `.default()`
   or `.optional()`. Lists need `itemLabel`. Reuse `mediaRef`, `linkRef`,
   `buttonItem`, `sectionBackground` from `src/widgets/lib.ts`.
2. Create `src/widgets/<key>/index.tsx`: RSC, arrow function, default export,
   `type Props = z.infer<typeof schema>` import from `./schema`. Use
   `Section`/`Container`, theme vars (`var(--pp-c-primary)` etc.), classes
   `pp-heading`/`pp-muted`/`pp-on-dark`. Interactivity goes in a separate
   `"use client"` leaf file the RSC imports.
3. Register: one `def(Component, schema, meta)` line in
   `src/widgets/registry.ts` (imports at top, entry in `widgetRegistry`).
4. Verify: `pnpm typecheck`; restart dev; widget appears in the builder
   palette; insert → renders with defaults; fill fields → preview updates;
   publish → live page correct. Full checklist: docs/WIDGETS.md §Testing.

## 2. Add a Studio API endpoint

1. Service function in `src/modules/<domain>/<domain>.service.ts`
   (`import "server-only"` at top). DB via `db` from `src/lib/db.ts`.
   If it mutates public content: `expireTag(...)` with the right tags
   (docs/DEVELOPER.md §10). Always `await audit(userId, "domain.action", "Entity:id")`.
2. Route `src/app/api/studio/<resource>/route.ts` (or `[id]/route.ts` with
   `type Params = { params: Promise<{ id: string }> }`):

   ```ts
   export const POST = (req: NextRequest) =>
     handleApi(async () => {
       const user = await requireCapability("pages.manage"); // pick the right guard
       const body = bodySchema.parse(await req.json());      // Zod, always
       return myService(user.id, body);
     });
   ```

   Guard choice: `requireSession` (any active user), `requireCapability`
   (matrix in `permissions.ts`), `requirePageAccess(pageId, "EDIT"|"PUBLISH")`
   for page content. Map service throws to statuses with `ApiAuthError` only
   when a specific code matters (409 IN_USE, 422 BLOCKED, ...).
3. Client: add calls via `api.*` from `src/services/api.ts` inside the screen
   component; react-query mutation + `invalidateQueries` + toast.
4. Verify: typecheck; curl the endpoint logged-in (see §10) for the success
   envelope, a 401 logged-out, and a 400 on bad input.

## 3. Add a Studio screen (new sidebar section)

1. Components folder `src/components/studio/<concern>/` — one orchestrator
   (`<concern>-screen.tsx`, `"use client"`) plus small parts (table, dialog,
   sheet). Copy patterns from `src/components/studio/pages/`.
2. Route `src/app/studio/<concern>/page.tsx`: thin wrapper; add `<Suspense>`
   if the screen reads `useSearchParams`.
3. Sidebar entry in `src/components/studio/shell/studio-sidebar.tsx` (NAV
   array; set `capability` to hide it from unauthorized roles) and title in
   `studio-topbar.tsx` TITLES.
4. Verify: screen renders for an authorized role, hidden for others, all
   mutations toast + refresh.

## 4. Add a setting key

1. Add the key to `SETTING_KEYS` in
   `src/modules/settings/settings.service.ts`; add to `ENCRYPTED_KEYS` if it
   holds secrets; export a typed shape + defaults.
2. Form component in `src/components/studio/settings/` using
   `useSettingForm<T>("<key>", DEFAULTS)` + `SettingsFormCard`; add a tab in
   `settings-screen.tsx`.
3. Consume server-side via `getSetting`/`getSettingCached` (cached reads are
   tagged `settings` and expire automatically on save).
4. Verify: save in UI → value persists; consumer sees it after save.

## 5. Add a role capability

1. Extend the `Capability` union and role arrays in
   `src/modules/auth/permissions.ts`.
2. Guard the route(s) with `requireCapability("your.capability")`.
3. Gate UI with `can(role, "your.capability")` (sidebar item, buttons).
4. Verify with two accounts (or temporarily change the seeded user's role):
   403 from API and hidden UI for the unauthorized role.

## 6. Change the database schema

1. Edit `prisma/schema.prisma` (never add `url` to the datasource; Prisma 7
   keeps it in `prisma.config.ts`).
2. `pnpm db:migrate` (prompts for a migration name; applies to dev DB and
   regenerates the client into `src/generated/prisma`).
3. Update services/types that touch the model; `pnpm typecheck` will point at
   most of them.
4. If public-facing data changed shape, check `section-renderer`, page/blog
   services, and the seed (`prisma/seed.ts` is standalone: no `@/` imports,
   no `server-only` modules).
5. Verify: migrate runs clean, seed still runs (`pnpm db:seed` is idempotent),
   build passes.

## 7. Add a cache-backed public read

1. Wrap the read in `cached(fn, ["key-parts"], [TAGS.x])` in a module service.
2. Add a tag to `TAGS` in `src/lib/cache.ts` if none fits.
3. Expire it (`expireTag(TAGS.x)`) in every mutation that invalidates it.
4. Verify: mutate → refetch public page → fresh data on the next request
   (no second-request staleness; that means someone used `revalidateTag`
   directly instead of `expireTag`).

## 8. Add an inspector control type (builder)

1. Add the control name to `FieldControl` in `src/types/index.ts`.
2. Implement the component under
   `src/components/studio/builder/inspector/controls/`.
3. Dispatch it in `inspector/field-control.tsx`.
4. Document it in `docs/WIDGETS.md` control table.
5. Verify with a widget field using the new control: edit → autosave →
   preview reflects the value; publish validates.

## 9. Ship a blog/editorial change

Editor UI lives in `src/components/studio/blog/post-editor/`; public
rendering in `src/app/(site)/blog/` + `tiptapToHtml` in
`src/modules/blog/blog.service.ts`. If you add a TipTap node type, extend
BOTH the editor extensions and the `renderNode` switch in `tiptapToHtml`
(and its sanitize allowlist in `src/lib/sanitize.ts`), or published HTML will
silently drop the node.

## 10. Verify like the CI you wish existed

```bash
pnpm typecheck && pnpm lint && pnpm build
```

Functional pass (dev or prod server + seeded DB), scriptable with curl:

```bash
# login (cookie jar)
CSRF=$(curl -s -c jar.txt localhost:3001/api/auth/csrf | node -pe "JSON.parse(require('fs').readFileSync(0)).csrfToken")
curl -s -b jar.txt -c jar.txt -X POST localhost:3001/api/auth/callback/credentials \
  -d "csrfToken=$CSRF&email=admin@example.com&password=<seed pw>"

# page lifecycle
curl -s -b jar.txt -X POST localhost:3001/api/studio/pages -H 'Content-Type: application/json' \
  -d '{"path":"/smoke","title":"Smoke"}'                       # → data.id
curl -s -b jar.txt -X PATCH localhost:3001/api/studio/pages/<id>/draft -H 'Content-Type: application/json' \
  -d '{"sections":[{"id":"s1","type":"heading","props":{"text":"Hi","level":"h1","align":"left"}}]}'
curl -s -b jar.txt -X POST localhost:3001/api/studio/pages/<id>/publish
curl -s localhost:3001/smoke | grep Hi                         # must match
curl -s -b jar.txt -X DELETE localhost:3001/api/studio/pages/<id>
```

Media lifecycle: presign → upload (ImageKit or `upload-local`) → commit →
trash (`DELETE media/:id`) → purge (`DELETE media/:id?purge=1`); purge must
remove the stored object (ImageKit file or `public/uploads` file).

## 11. Deploy / release

See `docs/DEPLOY.md`. Short form: `pnpm install --frozen-lockfile` →
`pnpm db:generate` → `pnpm prisma migrate deploy` → `pnpm build` →
`pnpm start`; cron hits `/api/cron/scheduled-posts?key=$REVALIDATE_KEY`
every minute; secrets via `openssl rand -base64 32` or the node one-liner in
docs/DEVELOPER.md §8.
