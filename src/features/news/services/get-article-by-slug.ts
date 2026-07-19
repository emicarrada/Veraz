import type { ArticleDetailItem } from "@/features/news/types/article-detail";
import { mapArticleDetailRecord } from "@/features/news/services/article-detail-mapper";
import type { ArticleDetailLoadResult } from "@/features/news/types/article-detail";
import type { ArticleRepository } from "@/lib/repositories/contracts/article-repository";
import { createContentRepositories } from "@/lib/repositories/factory";

export type GetArticleBySlugParams = {
  slug: string;
  articleRepository?: ArticleRepository | null;
};

export async function getArticleBySlug(
  params: GetArticleBySlugParams,
): Promise<ArticleDetailLoadResult> {
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
      message: "La base de datos no está configurada.",
    };
  }

  try {
    const record = await repository.findBySlug(slug);
    if (!record) {
      return { ok: false, error: "not_found" };
    }

    return { ok: true, data: mapArticleDetailRecord(record) };
  } catch (error) {
    return {
      ok: false,
      error: "load_failed",
      message:
        error instanceof Error ? error.message : "No se pudo cargar el artículo.",
    };
  }
}

export function buildArticleDetailPath(slug: string): string {
  return `/noticias/${slug}`;
}

export function buildArticleDetailUrl(slug: string, siteUrl: string): string {
  const base = siteUrl.replace(/\/$/, "");
  return `${base}${buildArticleDetailPath(slug)}`;
}

export function buildArticleDetailMetadata(article: ArticleDetailItem, siteUrl: string) {
  const url = buildArticleDetailUrl(article.slug, siteUrl);
  const description = article.excerpt.slice(0, 160);

  return {
    title: `${article.title} | Veraz`,
    description,
    alternates: {
      canonical: buildArticleDetailPath(article.slug),
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
): Record<string, unknown> {
  const url = buildArticleDetailUrl(article.slug, siteUrl);

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
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
    },
    ...(article.heroImage
      ? {
          image: [article.heroImage.url],
        }
      : {}),
    isBasedOn: article.canonicalUrl,
  };
}
