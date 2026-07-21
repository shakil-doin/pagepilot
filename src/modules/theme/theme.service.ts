import "server-only";
import { db } from "@/lib/db";
import { cached, withFallback, TAGS, expireTag } from "@/lib/cache";
import { audit } from "@/modules/auth/audit.service";
import type { ThemeTokens } from "@/types";

export const DEFAULT_TOKENS: ThemeTokens = {
  colors: {
    primary: { value: "#3565F9", label: "Primary" },
    secondary: { value: "#06174C", label: "Secondary" },
    accent: { value: "#8BA6FF", label: "Accent" },
    background: { value: "#FFFFFF", label: "Background" },
    surface: { value: "#F8FAFC", label: "Surface" },
    text: { value: "#0F172A", label: "Heading text" },
    textMuted: { value: "#334155", label: "Body text" },
    border: { value: "#E2E8F0", label: "Border" },
    success: { value: "#16A34A", label: "Success" },
    danger: { value: "#EF4444", label: "Danger" },
  },
  gradients: {
    brand: { from: "secondary", to: "primary", angle: 90 },
  },
  typography: {
    headingFont: "Rubik",
    bodyFont: "Rubik",
    scale: { h1: "3.0rem", h2: "2.25rem", h3: "1.5rem", body: "1rem" },
    headingWeight: 600,
  },
  radii: { sm: "0.25rem", md: "0.5rem", lg: "0.75rem", xl: "1rem" },
  spacing: { sectionSm: "2rem", sectionMd: "4rem", sectionLg: "6rem" },
  container: { maxWidth: "1440px", gutter: "1rem" },
  buttons: {
    primary: { bg: "primary", text: "#fff", radius: "md", shadow: true },
    secondary: { bg: "transparent", text: "primary", border: "primary", radius: "md" },
  },
};

const DEFAULT_ACTIVE_THEME: { id: string | null; name: string; tokens: ThemeTokens } = {
  id: null,
  name: "Default",
  tokens: DEFAULT_TOKENS,
};

const activeThemeCached = cached(
  async () => {
    const theme = await db.theme.findFirst({ where: { active: true } });
    return theme ? { id: theme.id, name: theme.name, tokens: theme.tokens as ThemeTokens } : DEFAULT_ACTIVE_THEME;
  },
  ["active-theme"],
  [TAGS.theme],
);

// Never lets a DB failure break the site chrome: falls back to the default theme.
export const getActiveTheme = () => withFallback("active-theme", activeThemeCached, DEFAULT_ACTIVE_THEME);

// A color slot is either a token reference ("primary") or a raw CSS color.
const colorRef = (tokens: ThemeTokens, value: string): string =>
  tokens.colors[value] ? `var(--pp-c-${value})` : value;

// One inline <style> block in the site root layout. Changing the theme in the
// Studio revalidates the "theme" tag and the whole site repaints, no CSS build.
export const tokensToCss = (tokens: ThemeTokens): string => {
  const vars: string[] = [];
  for (const [key, token] of Object.entries(tokens.colors)) {
    vars.push(`--pp-c-${key}: ${token.value};`);
  }
  for (const [key, value] of Object.entries(tokens.radii)) {
    vars.push(`--pp-radius-${key}: ${value};`);
  }
  for (const [key, value] of Object.entries(tokens.spacing)) {
    vars.push(`--pp-space-${key}: ${value};`);
  }
  for (const [key, value] of Object.entries(tokens.typography.scale)) {
    vars.push(`--pp-text-${key}: ${value};`);
  }
  vars.push(`--pp-container-max: ${tokens.container.maxWidth};`);
  vars.push(`--pp-container-gutter: ${tokens.container.gutter};`);
  vars.push(`--pp-heading-weight: ${tokens.typography.headingWeight};`);

  for (const [key, gradient] of Object.entries(tokens.gradients ?? {})) {
    vars.push(
      `--pp-gradient-${key}: linear-gradient(${gradient.angle}deg, ${colorRef(tokens, gradient.from)}, ${colorRef(tokens, gradient.to)});`,
    );
  }

  const buttonCss = Object.entries(tokens.buttons)
    .map(([variant, button]) => {
      const rules = [
        `background: ${colorRef(tokens, button.bg)};`,
        `color: ${colorRef(tokens, button.text)};`,
        `border-radius: var(--pp-radius-${button.radius ?? "md"});`,
        button.border ? `border: 1px solid ${colorRef(tokens, button.border)};` : "border: 1px solid transparent;",
        button.shadow ? "box-shadow: 0 1px 2px rgb(0 0 0 / 0.15);" : "",
      ].join(" ");
      return `.pp-btn-${variant} { ${rules} }`;
    })
    .join("\n");

  return `:root { ${vars.join(" ")} }\n${buttonCss}`;
};

// Resolves a token-aware color value coming from a widget prop.
export const resolveColor = (tokens: ThemeTokens, value: string | undefined): string | undefined =>
  value ? colorRef(tokens, value) : undefined;

export const listThemes = () =>
  db.theme.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, name: true, active: true, updatedAt: true, createdAt: true, tokens: true } });

export const createTheme = async (userId: string, name: string, tokens: ThemeTokens, activate = false) => {
  const theme = await db.theme.create({ data: { name, tokens: tokens as object, active: false } });
  if (activate) await activateTheme(userId, theme.id);
  await audit(userId, "theme.create", `Theme:${theme.id}`, { name });
  return theme;
};

export const updateTheme = async (userId: string, id: string, data: { name?: string; tokens?: ThemeTokens }) => {
  const theme = await db.theme.update({
    where: { id },
    data: { name: data.name, tokens: data.tokens as object | undefined },
  });
  if (theme.active) expireTag(TAGS.theme);
  await audit(userId, "theme.update", `Theme:${id}`);
  return theme;
};

export const activateTheme = async (userId: string, id: string) => {
  await db.$transaction([
    db.theme.updateMany({ where: { active: true }, data: { active: false } }),
    db.theme.update({ where: { id }, data: { active: true } }),
  ]);
  expireTag(TAGS.theme);
  await audit(userId, "theme.activate", `Theme:${id}`);
};

export const deleteTheme = async (userId: string, id: string) => {
  const theme = await db.theme.findUnique({ where: { id } });
  if (!theme) return;
  if (theme.active) throw new Error("Cannot delete the active theme");
  await db.theme.delete({ where: { id } });
  await audit(userId, "theme.delete", `Theme:${id}`, { name: theme.name });
};
