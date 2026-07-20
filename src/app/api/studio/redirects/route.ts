import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApi, requireCapability, ApiAuthError } from "@/modules/auth/rbac";
import { listRedirects, createRedirect, importRedirectsCsv } from "@/modules/seo/seo.service";

export const GET = () =>
  handleApi(async () => {
    await requireCapability("seo.manage");
    return listRedirects();
  });

const createSchema = z.object({
  fromPath: z.string().min(1),
  toPath: z.string().min(1),
  permanent: z.boolean().optional(),
});

export const POST = (req: NextRequest) =>
  handleApi(async () => {
    const user = await requireCapability("seo.manage");
    const body = createSchema.parse(await req.json());
    try {
      return await createRedirect(user.id, body);
    } catch (err) {
      // Self-referencing or looping redirects are rejected by the service
      throw new ApiAuthError(400, "INVALID_REDIRECT", err instanceof Error ? err.message : "Invalid redirect");
    }
  });

const importSchema = z.object({ csv: z.string().min(1) });

export const PUT = (req: NextRequest) =>
  handleApi(async () => {
    const user = await requireCapability("seo.manage");
    const { csv } = importSchema.parse(await req.json());
    return importRedirectsCsv(user.id, csv);
  });
