import { revalidateTag, unstable_cache } from "next/cache";

export const TAGS = {
  page: (path: string) => `page:${path}`,
  pages: "pages", // list of published paths (sitemap, static params)
  theme: "theme",
  menu: "menu",
  globalWidget: (id: string) => `global-widget:${id}`,
  post: (slug: string) => `post:${slug}`,
  blogIndex: "blog-index",
  settings: "settings",
  redirects: "redirects",
  icons: "icons",
} as const;

// Immediate expiry so a publish is visible on the very next request.
// Next 16 deprecated the single-argument form; { expire: 0 } restores it.
export const expireTag = (...tags: string[]) => {
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
};

// Thin wrapper so all cached reads share one signature and stay greppable.
export const cached = <TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  keyParts: string[],
  tags: string[],
) => unstable_cache(fn, keyParts, { tags });
