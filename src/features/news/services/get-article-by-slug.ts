import { getTranslations } from "next-intl/server";

import { isArticleAccessibleForLocale } from "@/features/news/config/prestigious-sources";
import type { ArticleDetailItem } from "@/features/news/types/article-detail";
import { mapArticleDetailRecord } from "@/features/news/services/article-detail-mapper";
import { resolveArticleDisplay } from "@/features/news/services/resolve-article-display";
import type { ArticleDetailLoadResult } from "@/features/news/types/article-detail";
import { articleDetailPath } from "@/i18n/paths";
import type { Locale } from "@/i18n/routing";
import type { ArticleRepository } from "@/lib/repositories/contracts/article-repository";
import { createContentRepositories } from "@/lib/repositories/factory";
import { buildArticleAlternateLanguages, publisherLogoUrl } from "@/features/seo/build-page-metadata";

export type GetArticleBySlugParams = {
  slug: string;
  locale: Locale;
  articleRepository?: ArticleRepository | null;
};

export async function getArticleBySlug(
  params: GetArticleBySlugParams,
): Promise<ArticleDetailLoadResult> {
  const tErrors = await getTranslations("errors");
  const tFeed = await getTranslations("feed.categories");
  const slug = params.slug.trim();
  if (!slug) {
    return { ok: false, error: "not_found" };
  }

  const repository =
    params.articleRepository === undefined
      ? (createContentRepositories()?.articleRepository ?? null)
      : params.articleRepository;

  if (!repository) {
    return {
      ok: false,
      error: "not_configured",
      message: tErrors("dbNotConfigured"),
    };
  }

  try {
    const record = await repository.findBySlug(slug);
    if (!record) {
      return { ok: false, error: "not_found" };
    }

    if (
      !isArticleAccessibleForLocale(
        { sourceSlug: record.source.slug, languageCode: record.languageCode },
        params.locale,
      )
    ) {
      return { ok: false, error: "not_found" };
    }

    const base = mapArticleDetailRecord(record);
    const display = await resolveArticleDisplay(params.locale, {
      id: base.id,
      title: base.title,
      excerpt: base.excerpt,
      ...(base.bodyExcerpt ? { bodyExcerpt: base.bodyExcerpt } : {}),
      languageCode: record.languageCode,
    });

    const data: ArticleDetailItem = {
      ...base,
      title: display.title,
      excerpt: display.excerpt,
      ...(display.bodyExcerpt ? { bodyExcerpt: display.bodyExcerpt } : {}),
      categoryLabel: tFeed(base.categorySlug),
      languageCode: display.sourceLanguageCode,
      isTranslated: display.isTranslated,
      showOriginalLanguageNote: display.showOriginalLanguageNote,
    };

    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error: "load_failed",
      message: error instanceof Error ? error.message : tErrors("loadFailed"),
    };
  }
}

export function buildArticleDetailPath(slug: string, locale: Locale): string {
  return articleDetailPath(locale, slug);
}

export function buildArticleDetailUrl(slug: string, siteUrl: string, locale: Locale): string {
  const base = siteUrl.replace(/\/$/, "");
  return `${base}${buildArticleDetailPath(slug, locale)}`;
}

export function buildArticleDetailMetadata(
  article: ArticleDetailItem,
  siteUrl: string,
  locale: Locale,
) {
  const url = buildArticleDetailUrl(article.slug, siteUrl, locale);
  const description = article.excerpt.slice(0, 160);
  const path = buildArticleDetailPath(article.slug, locale);
  const alternateLanguages = buildArticleAlternateLanguages(
    article.slug,
    article.source.slug,
    article.languageCode,
  );

  return {
    title: article.title,
    description,
    alternates: {
      canonical: path,
      ...(Object.keys(alternateLanguages).length > 0
        ? { languages: alternateLanguages }
        : {}),
    },
    openGraph: {
      title: article.title,
      description,
      type: "article" as const,
      url,
      publishedTime: article.publishedAt,
      authors: article.byline ? [article.byline] : [article.source.attributionName],
      ...(article.heroImage ? { images: [article.heroImage.url] } : {}),
    },
    twitter: {
      card: article.heroImage ? ("summary_large_image" as const) : ("summary" as const),
      title: article.title,
      description,
      ...(article.heroImage ? { images: [article.heroImage.url] } : {}),
    },
  };
}

export function buildArticleNewsArticleJsonLd(
  article: ArticleDetailItem,
  siteUrl: string,
  locale: Locale,
): Record<string, unknown> {
  const url = buildArticleDetailUrl(article.slug, siteUrl, locale);
  const logoUrl = publisherLogoUrl(siteUrl);

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    inLanguage: locale === "en" ? "en" : "es-MX",
    articleSection: article.categoryLabel,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["#article-headline", "#article-factual-summary"],
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    author: {
      "@type": "Organization",
      name: article.source.attributionName,
      url: article.source.homepageUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Veraz",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: logoUrl,
      },
    },
    ...(article.heroImage
      ? {
          image: [article.heroImage.url],
        }
      : {}),
    isBasedOn: article.canonicalUrl,
  };
}
