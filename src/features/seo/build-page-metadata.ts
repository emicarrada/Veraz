import type { Metadata } from "next";

import { getAppConfig } from "@/config";
import { isArticleAccessibleForLocale } from "@/features/news/config/prestigious-sources";
import type { Locale } from "@/i18n/routing";
import { locales } from "@/i18n/routing";
import { feedPath, homePath, staticPath } from "@/i18n/paths";

export function indexableRobots(index = true): Metadata["robots"] {
  return {
    index,
    follow: true,
    googleBot: {
      index,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };
}

/** es-MX is the primary market. x-default follows Spanish. */
export function withRegionalAlternates(
  languages: Partial<Record<Locale, string>>,
): Record<string, string> {
  const alternates: Record<string, string> = {};
  if (languages.es) {
    alternates.es = languages.es;
    alternates["es-MX"] = languages.es;
    alternates["x-default"] = languages.es;
  }
  if (languages.en) alternates.en = languages.en;
  if (!alternates["x-default"] && languages.en) alternates["x-default"] = languages.en;
  return alternates;
}

export const SEO_OG_IMAGE = "/veraznegrologo.png" as const;
export const SEO_OG_IMAGE_WIDTH = 1200;
export const SEO_OG_IMAGE_HEIGHT = 630;

export const STATIC_PAGE_SEGMENTS = [
  "metodologia",
  "acerca-de",
  "contacto",
  "privacidad",
  "terminos",
  "fuentes",
] as const;

export type StaticPageSegment = (typeof STATIC_PAGE_SEGMENTS)[number];

export function openGraphLocale(locale: Locale): string {
  return locale === "en" ? "en_US" : "es_MX";
}

export function localePriority(locale: Locale): number {
  return locale === "es" ? 1 : 0.5;
}

export type BuildStaticPageMetadataInput = {
  locale: Locale;
  segment: StaticPageSegment;
  title: string;
  description: string;
  keywords?: string[];
  robots?: Metadata["robots"];
};

export function buildStaticPageMetadata(input: BuildStaticPageMetadataInput): Metadata {
  const { siteUrl } = getAppConfig();
  const canonical = staticPath(input.locale, `/${input.segment}`);

  return {
    title: input.title,
    description: input.description,
    ...(input.keywords ? { keywords: input.keywords } : {}),
    alternates: {
      canonical,
      languages: withRegionalAlternates(
        Object.fromEntries(locales.map((code) => [code, staticPath(code, `/${input.segment}`)])) as Partial<
          Record<Locale, string>
        >,
      ),
    },
    openGraph: {
      type: "website",
      locale: openGraphLocale(input.locale),
      url: canonical,
      siteName: getAppConfig().name,
      title: input.title,
      description: input.description,
      images: [
        {
          url: SEO_OG_IMAGE,
          width: SEO_OG_IMAGE_WIDTH,
          height: SEO_OG_IMAGE_HEIGHT,
          alt: getAppConfig().name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [SEO_OG_IMAGE],
    },
    robots: input.robots ?? indexableRobots(true),
    other:
      input.locale === "es"
        ? {
            "content-language": "es-MX",
          }
        : undefined,
  };
}

export type BuildFeedPageMetadataInput = {
  locale: Locale;
  title: string;
  description: string;
  canonicalPath: string;
  indexable?: boolean;
};

export function buildFeedPageMetadata(input: BuildFeedPageMetadataInput): Metadata {
  const { name } = getAppConfig();
  const canonical = input.canonicalPath;

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical,
      languages: withRegionalAlternates(
        Object.fromEntries(locales.map((code) => [code, feedPath(code)])) as Partial<Record<Locale, string>>,
      ),
    },
    openGraph: {
      type: "website",
      locale: openGraphLocale(input.locale),
      url: canonical,
      siteName: name,
      title: input.title,
      description: input.description,
      images: [
        {
          url: SEO_OG_IMAGE,
          width: SEO_OG_IMAGE_WIDTH,
          height: SEO_OG_IMAGE_HEIGHT,
          alt: name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [SEO_OG_IMAGE],
    },
    robots: indexableRobots(input.indexable !== false),
    other:
      input.locale === "es"
        ? {
            "content-language": "es-MX",
          }
        : undefined,
  };
}

export function buildSiteVerificationMetadata(): Metadata["verification"] | undefined {
  const google = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  const bing = process.env.BING_SITE_VERIFICATION?.trim();
  const yandex = process.env.YANDEX_SITE_VERIFICATION?.trim();

  if (!google && !bing && !yandex) return undefined;

  return {
    ...(google ? { google } : {}),
    ...(bing ? { other: { "msvalidate.01": bing } } : {}),
    ...(yandex ? { yandex } : {}),
  };
}

export function buildArticleAlternateLanguages(
  slug: string,
  sourceSlug: string,
  languageCode: string,
): Partial<Record<Locale, string>> {
  const languages: Partial<Record<Locale, string>> = {};

  for (const locale of locales) {
    if (isArticleAccessibleForLocale({ sourceSlug, languageCode }, locale)) {
      languages[locale] = `/${locale}/noticias/${slug}`;
    }
  }

  return languages;
}

export function publisherLogoUrl(siteUrl: string): string {
  return `${siteUrl.replace(/\/$/, "")}${SEO_OG_IMAGE}`;
}

export { homePath };
