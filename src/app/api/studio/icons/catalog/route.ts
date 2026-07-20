import { handleApi, requireCapability, ApiAuthError } from "@/modules/auth/rbac";

export const GET = () =>
  handleApi(async () => {
    await requireCapability("icons.install");
    try {
      const res = await fetch("https://api.iconify.design/collections?pretty=0");
      if (!res.ok) throw new Error(`Iconify responded ${res.status}`);
      return (await res.json()) as unknown;
    } catch {
      throw new ApiAuthError(502, "UPSTREAM", "Iconify API unreachable");
    }
  });
