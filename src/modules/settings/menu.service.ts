import "server-only";
import { db } from "@/lib/db";
import { cached, TAGS, expireTag } from "@/lib/cache";
import { audit } from "@/modules/auth/audit.service";
import type { MenuItem } from "@/types";

export const getMenu = cached(
  async (slot: string): Promise<MenuItem[]> => {
    const menu = await db.menu.findUnique({ where: { slot } });
    return (menu?.items as MenuItem[]) ?? [];
  },
  ["menu"],
  [TAGS.menu],
);

export const listMenus = () => db.menu.findMany({ orderBy: { slot: "asc" } });

export const saveMenu = async (userId: string, slot: string, items: MenuItem[]) => {
  await db.menu.upsert({
    where: { slot },
    create: { slot, items: items as object[] },
    update: { items: items as object[] },
  });
  expireTag(TAGS.menu);
  await audit(userId, "menu.update", `Menu:${slot}`);
};
