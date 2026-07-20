import { handleApi, requireSession } from "@/modules/auth/rbac";
import { buildManifest } from "@/widgets/manifest";
import { listCustomWidgets, listGlobalWidgets } from "@/modules/widgets/widget.service";

export const GET = () =>
  handleApi(async () => {
    await requireSession();
    const [customWidgets, globalWidgets] = await Promise.all([listCustomWidgets(), listGlobalWidgets()]);
    return { manifest: buildManifest(), customWidgets, globalWidgets };
  });
