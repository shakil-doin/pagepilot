# PagePilot

A section-driven, performance-first CMS built with Next.js, PostgreSQL and
Prisma. Developers write widgets; everyone else pilots the pages.

- **PagePilot Studio** (`/studio`): visual page builder, blog, media library,
  theme manager, SEO tools, users and settings. Zero code, zero deploys for
  content changes.
- **PagePilot Engine** (`/`): the public site. Statically rendered React
  Server Components with tag-based revalidation. No builder JavaScript ever
  ships to visitors.

## Quick start

```bash
pnpm install
cp .env.example .env      # set DATABASE_URL and secrets
pnpm db:migrate
pnpm db:seed              # superadmin, theme, menus, demo page, icons
pnpm dev
```

Sign in at `/login` with the seeded superadmin
(`SEED_SUPERADMIN_EMAIL` / `SEED_SUPERADMIN_PASSWORD` from `.env`).

## Documentation

| Doc | For |
| --- | --- |
| [docs/WIDGETS.md](docs/WIDGETS.md) | Authoring widgets (the only code developers write) |
| [docs/DEVELOPER.md](docs/DEVELOPER.md) | Full reference: architecture, stack, schema, API, caching, quirks |
| [docs/DEPLOY.md](docs/DEPLOY.md) | Env vars, storage, cron, backups, upgrades |
| [AGENT.md](AGENT.md) | Rules and guardrails for AI coding agents |
| [PROCESS.md](PROCESS.md) | Step-by-step recipes: add widget/endpoint/screen/setting, verify, deploy |

## Stack

Next.js (App Router, RSC), TypeScript strict, PostgreSQL 16 + Prisma,
Tailwind CSS v4, Auth.js v5, TipTap, dnd-kit, TanStack Query, Zod end to end.
pnpm only.
