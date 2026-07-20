import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApi, requireSession, requireCapability } from "@/modules/auth/rbac";
import { listMenus, saveMenu } from "@/modules/settings/menu.service";
import type { MenuItem } from "@/types";

export const GET = () =>
  handleApi(async () => {
    await requireSession();
    return listMenus();
  });

const menuItemSchema: z.ZodType<MenuItem> = z.lazy(() =>
  z.object({
    id: z.string().min(1),
    label: z.string(),
    href: z.string(),
    icon: z.string().optional(),
    badge: z.string().optional(),
    children: z.array(menuItemSchema).optional(),
  }),
);

const putSchema = z.object({ slot: z.string().min(1), items: z.array(menuItemSchema) });

export const PUT = (req: NextRequest) =>
  handleApi(async () => {
    const user = await requireCapability("navigation.manage");
    const body = putSchema.parse(await req.json());
    await saveMenu(user.id, body.slot, body.items);
    return { ok: true };
  });
