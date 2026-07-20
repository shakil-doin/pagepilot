import { handleApi, requireCapability } from "@/modules/auth/rbac";
import { db } from "@/lib/db";

export const GET = () =>
  handleApi(async () => {
    await requireCapability("settings.manage");
    const [
      pages,
      posts,
      categories,
      tags,
      themes,
      menus,
      settings,
      redirects,
      globalWidgets,
      customWidgets,
      iconSets,
    ] = await Promise.all([
      db.page.findMany({ include: { revisions: true, seo: true } }),
      db.post.findMany({ include: { seo: true } }),
      db.category.findMany(),
      db.tag.findMany(),
      db.theme.findMany(),
      db.menu.findMany(),
      db.setting.findMany(),
      db.redirect.findMany(),
      db.globalWidget.findMany(),
      db.customWidget.findMany(),
      // Icon bodies are megabytes of SVG; reinstall by prefix on import instead
      db.iconSet.findMany({ select: { prefix: true, name: true } }),
    ]);
    return {
      exportedAt: new Date().toISOString(),
      pages,
      posts,
      categories,
      tags,
      themes,
      menus,
      settings,
      redirects,
      globalWidgets,
      customWidgets,
      iconSets,
    };
  });
