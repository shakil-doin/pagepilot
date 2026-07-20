import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApi, requireCapability } from "@/modules/auth/rbac";
import { db } from "@/lib/db";
import { audit } from "@/modules/auth/audit.service";

type Params = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  grants: z.array(
    z.object({
      userId: z.string().min(1),
      access: z.enum(["VIEW", "EDIT", "PUBLISH"]),
    }),
  ),
});

// Replaces the sharing list of one page (the page "Sharing" panel).
export const PUT = (req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const { id } = await params;
    const user = await requireCapability("pages.manage");
    const { grants } = bodySchema.parse(await req.json());
    await db.$transaction([
      db.pagePermission.deleteMany({ where: { pageId: id } }),
      db.pagePermission.createMany({ data: grants.map((grant) => ({ pageId: id, ...grant })) }),
    ]);
    await audit(user.id, "page.permissions.set", `Page:${id}`, { grants: grants.length });
    return { ok: true };
  });
