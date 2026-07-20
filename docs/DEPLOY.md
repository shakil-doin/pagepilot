# Deploying PagePilot

## Requirements

- Node 20+ (Node 24 recommended), pnpm 9+
- PostgreSQL 16+
- An ImageKit account (imagekit.io) for media in production; local-disk
  fallback is for development only
- Somewhere to run one cron request per minute

## Environment variables

All read once in `src/config/app.config.ts`. See `.env.example`.

```bash
# Core
DATABASE_URL=postgresql://user:pass@host:5432/pagepilot
APP_URL=https://example.com            # canonical base URL (also used by SEO)
APP_SECRET=<32+ random bytes>          # settings encryption + signing
AUTH_SECRET=<32+ random bytes>         # Auth.js JWT
REVALIDATE_KEY=<random>                # guards /api/revalidate and /api/cron/*

# Seed (first deploy only)
SEED_SUPERADMIN_EMAIL=admin@example.com
SEED_SUPERADMIN_PASSWORD=<set before first seed; change after first login>

# Storage
IMAGEKIT_PUBLIC_KEY=public_...
IMAGEKIT_PRIVATE_KEY=private_...
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/<your_id>
IMAGEKIT_FOLDER=/pagepilot               # media library folder for uploads

# Optional
SMTP_HOST= SMTP_PORT= SMTP_USER= SMTP_PASS= SMTP_FROM=
GOOGLE_CLIENT_ID= GOOGLE_CLIENT_SECRET=
```

Generate secrets with `openssl rand -base64 32`. Secrets saved through the
Studio settings UI are encrypted at rest (AES-256-GCM with `APP_SECRET`);
env values always win over UI values so ops can pin them.

## Build and run

```bash
pnpm install --frozen-lockfile
pnpm db:generate
pnpm prisma migrate deploy      # migrations, never db push
pnpm build
pnpm start                      # or a process manager / container
```

First deploy only: `pnpm db:seed` (idempotent; safe to re-run).

The app is a standard Next.js server: any Node host, container platform or
Vercel-style platform works. The public pages are static with tag-based ISR,
so a single small instance serves heavy traffic; the database is only hit on
revalidation, previews and Studio usage.

### ImageKit storage

- Grab the public key, private key and URL endpoint from the ImageKit
  dashboard (Developer options).
- Uploads go browser → ImageKit directly with server-signed auth params; the
  private key never leaves the server. No CORS setup is needed.
- The database stores the ImageKit `fileId` as the media storage key, so a
  permanent delete in the Studio (Trash → Delete forever, or the danger-zone
  trash purge) also deletes the asset from ImageKit. Trashed media stays in
  ImageKit until purged, which is what makes Restore possible.
- ImageKit serves media through its own CDN; `next/image` resizes from the
  delivered URL.

## Cron: scheduled posts

Hit this once per minute (any scheduler: crontab, GitHub Actions, platform cron):

```
* * * * * curl -fsS "https://example.com/api/cron/scheduled-posts?key=$REVALIDATE_KEY" > /dev/null
```

It flips due SCHEDULED posts to PUBLISHED and revalidates the blog. The same
key guards `/api/revalidate` for external cache-busting:

```bash
curl -X POST https://example.com/api/revalidate \
  -H "x-revalidate-key: $REVALIDATE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"tags":["pages","theme"]}'
```

A second useful cron (daily) is trash purging, available in the Studio danger
zone or by keeping media trash small manually; 30-day-old trash is purged
whenever the danger-zone purge runs.

## Backups and restore

- **Database**: nightly `pg_dump`:

  ```bash
  pg_dump "$DATABASE_URL" --format=custom --file="pagepilot-$(date +%F).dump"
  # restore: pg_restore --clean --dbname "$DATABASE_URL" pagepilot-YYYY-MM-DD.dump
  ```

- **Media**: ImageKit retains the assets; export/backup via the ImageKit
  dashboard or API if you need an off-site copy. The database stores only
  fileIds and URLs.
- **Content export**: Studio → Settings → Danger zone → Export downloads a
  JSON dump of pages, posts, theme, menus, settings and redirects; useful for
  seeding staging environments.

## Upgrades

1. Back up the database (above).
2. Deploy the new code with `pnpm prisma migrate deploy` in the build step.
3. Never run `prisma db push` against production.
4. For big tables, create new indexes with `CREATE INDEX CONCURRENTLY`
   outside the migration transaction (`-- prisma migrate` marker comments or a
   manual maintenance window).
5. Widget schema changes: additive with defaults is safe; breaking changes
   flag affected pages in the Studio until edited (see docs/WIDGETS.md).

## Security checklist

- `/studio` and `/api/studio/*` are session-guarded plus per-handler RBAC;
  keep `AUTH_SECRET`/`APP_SECRET` long and private.
- Login and public form endpoints are rate-limited in-process; put a CDN/WAF
  rate limit in front for defense in depth on multi-instance deploys.
- The html-embed widget and rich text are sanitized server-side, but only
  ADMIN+ can place raw embeds; keep it that way.
- `robots.txt` blocks `/studio` and `/api`; the sitemap only lists published,
  non-excluded content.
