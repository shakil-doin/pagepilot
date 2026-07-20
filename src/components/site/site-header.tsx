import Link from "next/link";
import Container from "@/components/site/container";
import { getMenu } from "@/modules/settings/menu.service";
import { getSettingCached } from "@/modules/settings/settings.service";
import { DEFAULT_GENERAL, type GeneralSettings } from "@/modules/settings/settings.service";
import type { MenuItem } from "@/types";

const NavLink = ({ item }: { item: MenuItem }) => {
  if (item.children && item.children.length > 0) {
    return (
      <div className="group relative">
        <span className="cursor-default py-2 text-sm font-medium">{item.label}</span>
        <div className="invisible absolute left-0 top-full z-40 min-w-44 rounded-[var(--pp-radius-md)] border bg-white py-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100"
          style={{ borderColor: "var(--pp-c-border)" }}>
          {item.children.map((child) => (
            <Link key={child.id} href={child.href} className="block px-4 py-1.5 text-sm hover:opacity-70">
              {child.label}
            </Link>
          ))}
        </div>
      </div>
    );
  }
  return (
    <Link href={item.href} className="py-2 text-sm font-medium transition-opacity hover:opacity-70">
      {item.label}
    </Link>
  );
};

const SiteHeader = async () => {
  const [items, general] = await Promise.all([
    getMenu("header"),
    getSettingCached("site.general") as Promise<GeneralSettings | null>,
  ]);
  const settings = general ?? DEFAULT_GENERAL;

  return (
    <header className="border-b" style={{ borderColor: "var(--pp-c-border)", background: "var(--pp-c-background)" }}>
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold" style={{ color: "var(--pp-c-text)" }}>
          {settings.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.logoUrl} alt={settings.siteName} className="h-8 w-auto" />
          ) : (
            settings.siteName
          )}
        </Link>
        <nav className="hidden items-center gap-6 md:flex" style={{ color: "var(--pp-c-text)" }}>
          {items.map((item) => (
            <NavLink key={item.id} item={item} />
          ))}
        </nav>
      </Container>
    </header>
  );
};

export default SiteHeader;
