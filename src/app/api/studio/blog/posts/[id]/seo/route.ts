import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApi, requireCapability } from "@/modules/auth/rbac";
import { upsertSeo } from "@/modules/seo/seo.service";

type Params = { params: Promise<{ id: string }> };

const seoSchema = z.object({
  metaTitle: z.string().max(200).nullish(),
  metaDescription: z.string().max(500).nullish(),
  canonicalUrl: z.string().max(500).nullish(),
  robots: z.string().max(100).nullish(),
  ogTitle: z.string().max(200).nullish(),
  ogDescription: z.string().max(500).nullish(),
  ogImageId: z.string().nullish(),
  ogType: z.string().max(50).nullish(),
  twitterCard: z.string().max(50).nullish(),
  structuredData: z.unknown().optional(),
  excludeFromSitemap: z.boolean().optional(),
  sitemapPriority: z.number().min(0).max(1).nullish(),
  sitemapChangeFreq: z.string().max(20).nullish(),
});

export const PUT = (req: NextRequest, { params }: Params) =>
  handleApi(async () => {
    const { id } = await params;
    const user = await requireCapability("blog.draft");
    const body = seoSchema.parse(await req.json());
    return upsertSeo(user.id, { postId: id }, body);
  });
