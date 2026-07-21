import { handleApi, requireSession } from "@/modules/auth/rbac";
import { buildManifest } from "@/widgets/manifest";
import { listCustomWidgets, listGlobalWidgets } from "@/modules/widgets/widget.service";
import { getActiveTheme, tokensToCss } from "@/modules/theme/theme.service";
import { fontCssValue, allSiteFontVariables } from "@/lib/fonts";

export const GET = () =>
  handleApi(async () => {
    await requireSession();
    const [customWidgets, globalWidgets, theme] = await Promise.all([
      listCustomWidgets(),
      listGlobalWidgets(),
      getActiveTheme(),
    ]);

    // The builder canvas renders in-document (no iframe), so it needs the same
    // theme tokens the public site injects — scoped to .pp-canvas so the site
    // palette never leaks into the studio chrome.
    const fontVars = `.pp-canvas { --pp-font-heading: ${fontCssValue(theme.tokens.typography.headingFont)}; --pp-font-body: ${fontCssValue(theme.tokens.typography.bodyFont)}; }`;
    const themeCss = `${tokensToCss(theme.tokens).replace(":root", ".pp-canvas")}\n${fontVars}`;

    return { manifest: buildManifest(), customWidgets, globalWidgets, themeCss, fontClass: allSiteFontVariables };
  });
