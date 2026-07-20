import Link from "next/link";
import Container from "@/components/site/container";
import { getMenu } from "@/modules/settings/menu.service";
import { getSettingCached, DEFAULT_GENERAL, type GeneralSettings } from "@/modules/settings/settings.service";
import type { MenuItem } from "@/types";

const FooterColumn = ({ item }: { item: MenuItem }) => (
  <div>
    <p className="mb-3 text-sm font-semibold" style={{ color: "var(--pp-c-text)" }}>
      {item.label}
    </p>
    <ul className="space-y-2">
      {(item.children ?? []).map((child) => (
        <li key={child.id}>
          <Link href={child.href} className="text-sm transition-opacity hover:opacity-70">
            {child.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const SiteFooter = async () => {
  const [items, general] = await Promise.all([
    getMenu("footer"),
    getSettingCached("site.general") as Promise<GeneralSettings | null>,
  ]);
  const settings = general ?? DEFAULT_GENERAL;
  const columns = items.filter((item) => item.children && item.children.length > 0);
  const flat = items.filter((item) => !item.children || item.children.length === 0);

  return (
    <footer className="border-t py-12" style={{ borderColor: "var(--pp-c-border)", background: "var(--pp-c-surface)" }}>
      <Container>
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <p className="text-lg font-bold" style={{ color: "var(--pp-c-text)" }}>
              {settings.siteName}
            </p>
            {settings.tagline ? <p className="pp-muted mt-2 text-sm">{settings.tagline}</p> : null}
          </div>
          {columns.length > 0 ? (
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              {columns.map((item) => (
                <FooterColumn key={item.id} item={item} />
              ))}
            </div>
          ) : null}
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t pt-6 text-sm sm:flex-row" style={{ borderColor: "var(--pp-c-border)" }}>
          <p className="pp-muted">
            © {new Date().getFullYear()} {settings.siteName}. All rights reserved.
          </p>
          {flat.length > 0 ? (
            <nav className="flex flex-wrap gap-4">
              {flat.map((item) => (
                <Link key={item.id} href={item.href} className="transition-opacity hover:opacity-70">
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
      </Container>
    </footer>
  );
};

export default SiteFooter;
