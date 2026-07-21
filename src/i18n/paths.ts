/**
 * Path helpers — two families:
 *
 * - *Pathname() — internal paths WITHOUT locale prefix. Use with next-intl Link,
 *   useRouter, usePathname (middleware adds /es or /en).
 * - *Path(locale) — localized paths WITH prefix. Use for metadata, hreflang,
 *   and native <a> hrefs.
 */
import type { Locale } from "@/i18n/routing";
import { locales } from "@/i18n/routing";

const FEED_SEGMENT = "/noticias";

// ---------------------------------------------------------------------------
// Internal pathnames (next-intl — no locale prefix)
// ---------------------------------------------------------------------------

export function homePathname(): string {
  return "/";
}

export function feedPathname(): string {
  return FEED_SEGMENT;
}

export function articleDetailPathname(slug: string): string {
  return `${FEED_SEGMENT}/${slug}`;
}

export function staticPathname(segment: string): string {
  return segment.startsWith("/") ? segment : `/${segment}`;
}

export type FeedPathnameQuery = {
  q?: string;
  categoria?: string;
};

export function feedPathnameWithQuery(query?: FeedPathnameQuery): string {
  if (!query) return FEED_SEGMENT;

  const params = new URLSearchParams();
  if (query.categoria) params.set("categoria", query.categoria);
  const trimmedQ = query.q?.trim();
  if (trimmedQ) params.set("q", trimmedQ);

  const search = params.toString();
  return search ? `${FEED_SEGMENT}?${search}` : FEED_SEGMENT;
}

/** @deprecated Prefer feedPathnameWithQuery */
export function feedReturnPathname(categorySlug?: string): string {
  if (!categorySlug || categorySlug === "general") {
    return FEED_SEGMENT;
  }

  return `${FEED_SEGMENT}?categoria=${encodeURIComponent(categorySlug)}`;
}

// ---------------------------------------------------------------------------
// Localized paths (metadata, hreflang, native anchors)
// ---------------------------------------------------------------------------

export function feedPath(locale: Locale): string {
  return `/${locale}${FEED_SEGMENT}`;
}

export function articleDetailPath(locale: Locale, slug: string): string {
  return `${feedPath(locale)}/${slug}`;
}

export function feedReturnPath(locale: Locale, categorySlug?: string): string {
  if (!categorySlug || categorySlug === "general") {
    return feedPath(locale);
  }

  return `${feedPath(locale)}?categoria=${encodeURIComponent(categorySlug)}`;
}

export function homePath(locale: Locale): string {
  return `/${locale}`;
}

export function staticPath(locale: Locale, segment: string): string {
  return `/${locale}${staticPathname(segment)}`;
}

/** Strip /es or /en prefix for active-nav matching (once). */
export function stripLocalePrefix(pathname: string): string {
  for (const locale of locales) {
    const prefix = `/${locale}`;
    if (pathname === prefix) return "/";
    if (pathname.startsWith(`${prefix}/`)) {
      return pathname.slice(prefix.length) || "/";
    }
  }

  return pathname;
}

export { FEED_SEGMENT };
