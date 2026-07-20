// Shared types and helpers for the theme manager screen.
import type { ThemeTokens } from "@/types";

export type ThemeRow = {
  id: string;
  name: string;
  active: boolean;
  tokens: ThemeTokens;
  updatedAt: string;
  createdAt: string;
};

export type ThemeListResponse = {
  themes: ThemeRow[];
  defaultTokens: ThemeTokens;
};

// A color slot holds either a token name ("primary") or a raw CSS color.
export const resolveTokenColor = (tokens: ThemeTokens, value: string | undefined): string | undefined =>
  value === undefined ? undefined : (tokens.colors[value]?.value ?? value);

export const cloneTokens = (tokens: ThemeTokens): ThemeTokens => JSON.parse(JSON.stringify(tokens)) as ThemeTokens;

export const tokensEqual = (a: ThemeTokens, b: ThemeTokens): boolean => JSON.stringify(a) === JSON.stringify(b);
