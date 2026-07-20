import { NextRequest } from "next/server";
import { handleApi, requireCapability } from "@/modules/auth/rbac";
import { listMedia } from "@/modules/media/media.service";
import type { MediaKind } from "@/generated/prisma/enums";

export const GET = (req: NextRequest) =>
  handleApi(async () => {
    await requireCapability("media.manage");
    const params = req.nextUrl.searchParams;
    return listMedia({
      folderId: params.get("folderId"),
      kind: (params.get("kind") as MediaKind) || undefined,
      query: params.get("query") ?? undefined,
      trash: params.get("trash") === "1",
      cursor: params.get("cursor") ?? undefined,
    });
  });
