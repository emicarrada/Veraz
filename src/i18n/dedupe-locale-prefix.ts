import { locales } from "@/i18n/routing";

const LOCALE_PATTERN = locales.join("|");
const DUPLICATE_LOCALE_PREFIX = new RegExp(`^/(${LOCALE_PATTERN})/(${LOCALE_PATTERN})(/.*|$)`);

/**
 * Collapse duplicated locale segments: /en/en/noticias → /en/noticias
 * Returns null when no deduplication is needed.
 */
export function dedupeLocalePrefix(pathname: string): string | null {
  const match = pathname.match(DUPLICATE_LOCALE_PREFIX);
  if (!match) return null;

  const [, , locale, rest = ""] = match;
  return `/${locale}${rest}`;
}
