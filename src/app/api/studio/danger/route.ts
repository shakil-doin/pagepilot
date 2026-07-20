import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApi, requireCapability } from "@/modules/auth/rbac";
import { db } from "@/lib/db";
import { TAGS, expireTag } from "@/lib/cache";
import { purgeMedia } from "@/modules/media/media.service";
import { audit } from "@/modules/auth/audit.service";

const bodySchema = z.object({ action: z.enum(["flush-cache", "purge-trash"]) });

export const POST = (req: NextRequest) =>
  handleApi(async () => {
    const user = await requireCapability("settings.manage");
    const { action } = bodySchema.parse(await req.json());

    if (action === "flush-cache") {
      const tags = [
        TAGS.pages,
        TAGS.theme,
        TAGS.menu,
        TAGS.settings,
        TAGS.blogIndex,
        TAGS.redirects,
        TAGS.icons,
        "global-widgets",
        "custom-widgets",
      ];
      expireTag(...tags);
      await audit(user.id, "danger.flush-cache", "Cache", { tags: tags.length });
      return { action, count: tags.length };
    }

    // Purge everything in the trash now, not just items older than 30 days
    const trashed = await db.media.findMany({ where: { deletedAt: { not: null } }, select: { id: true } });
    const count = await purgeMedia(user.id, trashed.map((media) => media.id));
    await audit(user.id, "danger.purge-trash", "Media", { purged: count });
    return { action, count };
  });
