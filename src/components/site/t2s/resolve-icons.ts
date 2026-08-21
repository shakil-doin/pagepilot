import "server-only";
import { getIconSvg } from "@/modules/icons/icon.service";

// Resolves a list of icon refs ("ph:rocket") to inline SVG, preserving order so
// a widget can hand the result straight to its presentational view. Refs repeat
// often inside one section, so identical refs are fetched once.
export const resolveIcons = async (
  refs: (string | undefined)[],
  size = 24,
): Promise<(string | null)[]> => {
  const unique = [...new Set(refs.filter((ref): ref is string => Boolean(ref)))];
  const entries = await Promise.all(unique.map(async (ref) => [ref, await getIconSvg(ref, size)] as const));
  const bySvg = new Map(entries);
  return refs.map((ref) => (ref ? (bySvg.get(ref) ?? null) : null));
};
