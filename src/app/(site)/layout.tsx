import Script from "next/script";
import { getActiveTheme, tokensToCss } from "@/modules/theme/theme.service";
import { getSettingCached } from "@/modules/settings/settings.service";
import { fontCssValue, allSiteFontVariables } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import "./site.css";

type ScriptsSettings = {
  head?: string;
  bodyStart?: string;
  bodyEnd?: string;
  ga4Id?: string;
  gtmId?: string;
};

type MaintenanceSettings = { enabled?: boolean; message?: string };

// Site chrome shell: injects theme tokens as one inline <style> block (cached
// by the "theme" tag) plus analytics/scripts from settings. Header/footer are
// rendered by the pages so per-page hide flags can apply.
const SiteLayout = async ({ children }: { children: React.ReactNode }) => {
  const [theme, scripts, maintenance] = await Promise.all([
    getActiveTheme(),
    getSettingCached("scripts") as Promise<ScriptsSettings | null>,
    getSettingCached("maintenance") as Promise<MaintenanceSettings | null>,
  ]);

  const fontVars = `.pp-site { --pp-font-heading: ${fontCssValue(theme.tokens.typography.headingFont)}; --pp-font-body: ${fontCssValue(theme.tokens.typography.bodyFont)}; }`;

  if (maintenance?.enabled) {
    return (
      <div className={cn("pp-site flex min-h-screen items-center justify-center px-6", allSiteFontVariables)}>
        <style dangerouslySetInnerHTML={{ __html: tokensToCss(theme.tokens) + fontVars }} />
        <div className="max-w-md text-center">
          <h1 className="pp-heading text-3xl">Be right back</h1>
          <p className="pp-muted mt-4">{maintenance.message || "We are doing some scheduled maintenance. Check back soon."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("pp-site flex min-h-screen flex-col", allSiteFontVariables)}>
      <style dangerouslySetInnerHTML={{ __html: tokensToCss(theme.tokens) + fontVars }} />
      {scripts?.head ? <div dangerouslySetInnerHTML={{ __html: scripts.head }} hidden /> : null}
      {scripts?.ga4Id ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${scripts.ga4Id}`} strategy="afterInteractive" />
          <Script id="pp-ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${scripts.ga4Id}');`}
          </Script>
        </>
      ) : null}
      {scripts?.gtmId ? (
        <Script id="pp-gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${scripts.gtmId}');`}
        </Script>
      ) : null}
      {children}
    </div>
  );
};

export default SiteLayout;
