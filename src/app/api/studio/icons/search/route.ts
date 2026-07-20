import { NextRequest } from "next/server";
import { handleApi, requireSession } from "@/modules/auth/rbac";
import { searchIcons } from "@/modules/icons/icon.service";

export const GET = (req: NextRequest) =>
  handleApi(async () => {
    await requireSession();
    const params = req.nextUrl.searchParams;
    return searchIcons(
      params.get("q") ?? "",
      params.get("prefix") ?? undefined,
      Number(params.get("limit")) || undefined,
    );
  });
