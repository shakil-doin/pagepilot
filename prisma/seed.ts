/* Seeds a fresh install: superadmin (from env), default theme, header/footer
   menus, base settings, the Phosphor icon set (skipped offline) and a demo
   home page using the starter widgets. Run with: pnpm db:seed */
import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const DEFAULT_TOKENS = {
  colors: {
    primary: { value: "#3565F9", label: "Primary" },
    secondary: { value: "#06174C", label: "Secondary" },
    accent: { value: "#8BA6FF", label: "Accent" },
    background: { value: "#FFFFFF", label: "Background" },
    surface: { value: "#F8FAFC", label: "Surface" },
    text: { value: "#0F172A", label: "Heading text" },
    textMuted: { value: "#334155", label: "Body text" },
    border: { value: "#E2E8F0", label: "Border" },
    success: { value: "#16A34A", label: "Success" },
    danger: { value: "#EF4444", label: "Danger" },
  },
  gradients: { brand: { from: "secondary", to: "primary", angle: 90 } },
  typography: {
    headingFont: "Rubik",
    bodyFont: "Rubik",
    scale: { h1: "3.0rem", h2: "2.25rem", h3: "1.5rem", body: "1rem" },
    headingWeight: 600,
  },
  radii: { sm: "0.25rem", md: "0.5rem", lg: "0.75rem", xl: "1rem" },
  spacing: { sectionSm: "2rem", sectionMd: "4rem", sectionLg: "6rem" },
  container: { maxWidth: "1440px", gutter: "1rem" },
  buttons: {
    primary: { bg: "primary", text: "#fff", radius: "md", shadow: true },
    secondary: { bg: "transparent", text: "primary", border: "primary", radius: "md" },
  },
};

const sid = (n: number) => `sec_demo${n}`;

const DEMO_SECTIONS = [
  {
    id: sid(1),
    type: "hero",
    props: {
      eyebrow: "Welcome to PagePilot",
      headline: "Ship marketing pages without shipping code",
      subtext:
        "Compose sections visually, publish in seconds, and keep the site as fast as a hand-coded build. Developers write widgets; everyone else pilots the pages.",
      buttons: [
        { label: "Open the Studio", link: { href: "/studio" }, variant: "primary" },
        { label: "Read the blog", link: { href: "/blog" }, variant: "secondary" },
      ],
      layout: "center",
      background: "gradient",
    },
    adminLabel: "Welcome hero",
  },
  {
    id: sid(2),
    type: "stats-row",
    props: {
      columns: 4,
      items: [
        { value: "95+", label: "Lighthouse performance" },
        { value: "0 KB", label: "CMS JavaScript shipped" },
        { value: "< 5 s", label: "Publish to live" },
        { value: "23", label: "Starter widgets" },
      ],
      background: "none",
    },
  },
  {
    id: sid(3),
    type: "feature-grid",
    props: {
      title: "Everything content teams need",
      description: "Every feature below was configured in the Studio, not coded.",
      columns: 3,
      items: [
        { title: "Visual builder", text: "Drag sections onto a live preview of the real page. What you see is what ships." },
        { title: "Design tokens", text: "Change a brand color once and the whole site repaints, no rebuild required." },
        { title: "First-class blog", text: "A Notion-style editor with scheduling, SEO panels and automatic RSS." },
        { title: "Media library", text: "Focal points, alt-text enforcement and automatic blur placeholders." },
        { title: "Roles and grants", text: "Give an editor exactly one landing page, or an admin the whole site." },
        { title: "SEO built in", text: "Sitemaps, redirects, structured data and social previews out of the box." },
      ],
      background: "surface",
    },
  },
  {
    id: sid(4),
    type: "steps",
    props: {
      title: "How it works",
      numbered: true,
      layout: "horizontal",
      items: [
        { title: "Developers add widgets", text: "One component, one schema, one registry line." },
        { title: "Editors compose pages", text: "Drag widgets, fill in the inspector form, hit publish." },
        { title: "Visitors get static pages", text: "Rendered on the server, cached at the edge, zero builder code." },
      ],
    },
  },
  {
    id: sid(5),
    type: "testimonial-slider",
    props: {
      title: "What teams say",
      items: [
        {
          quote: "We shipped a full campaign site in an afternoon. Engineering never opened their editor.",
          name: "Maya Chen",
          role: "Head of Growth",
          rating: 5,
        },
        {
          quote: "The site got faster after we moved to PagePilot. That is not how CMS migrations usually go.",
          name: "Jonas Weber",
          role: "Staff Engineer",
          rating: 5,
        },
      ],
      background: "none",
    },
  },
  {
    id: sid(6),
    type: "pricing-table",
    props: {
      title: "Simple pricing",
      description: "Self-hosted and open. These plans are demo content.",
      plans: [
        {
          name: "Starter",
          price: "$0",
          period: "forever",
          description: "For side projects",
          features: [{ text: "1 site" }, { text: "All widgets" }, { text: "Community support" }],
          button: { label: "Get started", link: { href: "/studio" }, variant: "secondary" },
          highlighted: false,
        },
        {
          name: "Team",
          price: "$29",
          period: "per month",
          description: "For growing teams",
          features: [{ text: "Unlimited pages" }, { text: "Roles and permissions" }, { text: "Priority support" }],
          button: { label: "Start trial", link: { href: "/studio" }, variant: "primary" },
          highlighted: true,
        },
      ],
      background: "surface",
    },
  },
  {
    id: sid(7),
    type: "faq",
    props: {
      title: "Frequently asked questions",
      items: [
        {
          question: "Does the builder slow down my site?",
          answer: "No. Published pages are static server-rendered HTML. The builder and its JavaScript never load for visitors.",
        },
        {
          question: "How do developers add new sections?",
          answer: "Write one React Server Component with a Zod schema and register it. The Studio picks it up automatically.",
        },
        {
          question: "Can I roll back a bad publish?",
          answer: "Yes. Every publish is an immutable revision; rollback is one click in the builder toolbar.",
        },
      ],
      background: "none",
    },
  },
  {
    id: sid(8),
    type: "cta",
    props: {
      headline: "Take the Studio for a spin",
      subtext: "Sign in with the seeded superadmin account and edit this very page.",
      buttons: [{ label: "Open PagePilot Studio", link: { href: "/studio" }, variant: "primary" }],
      style: "gradient",
    },
  },
];

const HEADER_MENU = [
  { id: "m1", label: "Home", href: "/" },
  { id: "m2", label: "Blog", href: "/blog" },
];

const FOOTER_MENU = [
  {
    id: "f1",
    label: "Product",
    href: "#",
    children: [
      { id: "f1a", label: "Home", href: "/" },
      { id: "f1b", label: "Blog", href: "/blog" },
    ],
  },
  { id: "f2", label: "Studio", href: "/studio" },
];

const seedIconSet = async () => {
  const existing = await db.iconSet.findUnique({ where: { prefix: "ph" } });
  if (existing) return console.log("• Icon set ph already installed");
  try {
    const info = (await (
      await fetch("https://api.iconify.design/collection?prefix=ph&icons=true&chars=false")
    ).json()) as { title?: string; uncategorized?: string[]; categories?: Record<string, string[]> };
    const names = [...(info.uncategorized ?? []), ...Object.values(info.categories ?? {}).flat()].slice(0, 1200);
    const icons: Record<string, unknown> = {};
    let width: number | undefined;
    let height: number | undefined;
    for (let i = 0; i < names.length; i += 200) {
      const chunk = names.slice(i, i + 200);
      const data = (await (
        await fetch(`https://api.iconify.design/ph.json?icons=${encodeURIComponent(chunk.join(","))}`)
      ).json()) as { icons: Record<string, unknown>; width?: number; height?: number };
      Object.assign(icons, data.icons);
      width = width ?? data.width;
      height = height ?? data.height;
    }
    await db.iconSet.create({
      data: {
        prefix: "ph",
        name: info.title ?? "Phosphor",
        data: JSON.parse(JSON.stringify({ prefix: "ph", icons, width, height })),
      },
    });
    console.log(`• Installed Phosphor icon set (${Object.keys(icons).length} icons)`);
  } catch {
    console.warn("• Skipped icon set install (Iconify API unreachable). Install later under Studio → Icons.");
  }
};

const main = async () => {
  const email = process.env.SEED_SUPERADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.SEED_SUPERADMIN_PASSWORD;
  if (!password) throw new Error("Set SEED_SUPERADMIN_PASSWORD in .env before seeding");

  const passwordHash = await hash(password, 12);
  await db.user.upsert({
    where: { email },
    create: { email, name: "Superadmin", role: "SUPERADMIN", passwordHash },
    update: { role: "SUPERADMIN" },
  });
  console.log(`• Superadmin ready: ${email}`);

  const themeCount = await db.theme.count();
  if (themeCount === 0) {
    await db.theme.create({ data: { name: "Default", active: true, tokens: DEFAULT_TOKENS } });
    console.log("• Default theme created and activated");
  }

  await db.menu.upsert({
    where: { slot: "header" },
    create: { slot: "header", items: HEADER_MENU },
    update: {},
  });
  await db.menu.upsert({
    where: { slot: "footer" },
    create: { slot: "footer", items: FOOTER_MENU },
    update: {},
  });
  console.log("• Header and footer menus seeded");

  await db.setting.upsert({
    where: { key: "site.general" },
    create: {
      key: "site.general",
      value: { siteName: "PagePilot Demo", tagline: "A section-driven, performance-first CMS", language: "en", timezone: "UTC" },
    },
    update: {},
  });
  await db.setting.upsert({
    where: { key: "seo.defaults" },
    create: {
      key: "seo.defaults",
      value: { titleTemplate: "%s | PagePilot Demo", defaultDescription: "Built with PagePilot, the section-driven CMS." },
    },
    update: {},
  });
  console.log("• Base settings seeded");

  const existingHome = await db.page.findUnique({ where: { path: "/" } });
  if (!existingHome) {
    const page = await db.page.create({ data: { path: "/", title: "Home", status: "PUBLISHED" } });
    const revision = await db.pageRevision.create({
      data: { pageId: page.id, sections: DEMO_SECTIONS, version: 1, note: "Seeded demo page" },
    });
    await db.page.update({ where: { id: page.id }, data: { publishedRevisionId: revision.id } });
    console.log("• Demo home page published at /");
  } else {
    console.log("• Home page already exists, leaving it alone");
  }

  await seedIconSet();
  console.log("Seed complete.");
};

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
