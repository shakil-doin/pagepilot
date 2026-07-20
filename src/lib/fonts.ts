import { Inter, Rubik, DM_Sans, Poppins, Playfair_Display } from "next/font/google";

// Studio UI font
export const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

// Curated site font list, self-hosted at build. The theme picks by name;
// adding a font here is the only code change fonts ever need.
const rubik = Rubik({ subsets: ["latin"], variable: "--font-rubik", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });

export const SITE_FONTS: Record<string, { variable: string; className: string; cssValue: string }> = {
  Inter: { variable: inter.variable, className: inter.className, cssValue: "var(--font-inter)" },
  Rubik: { variable: rubik.variable, className: rubik.className, cssValue: "var(--font-rubik)" },
  "DM Sans": { variable: dmSans.variable, className: dmSans.className, cssValue: "var(--font-dm-sans)" },
  Poppins: { variable: poppins.variable, className: poppins.className, cssValue: "var(--font-poppins)" },
  "Playfair Display": { variable: playfair.variable, className: playfair.className, cssValue: "var(--font-playfair)" },
};

export const SITE_FONT_NAMES = Object.keys(SITE_FONTS);

export const fontCssValue = (name: string): string =>
  SITE_FONTS[name]?.cssValue ?? "ui-sans-serif, system-ui, sans-serif";

// All site font variables so any theme font choice works without a rebuild
export const allSiteFontVariables = Object.values(SITE_FONTS)
  .map((font) => font.variable)
  .join(" ");
