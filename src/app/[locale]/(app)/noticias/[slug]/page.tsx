import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { getAppConfig } from "@/config/accessors";
import { ArticleDetailError } from "@/features/news/components/article-detail-view";
import { ArticleDetailView } from "@/features/news/components/article-detail-view";
import { ArticleJsonLd } from "@/features/news/components/article-json-ld";
import {
  buildArticleDetailMetadata,
  getArticleBySlug,
} from "@/features/news/services/get-article-by-slug";
import { CategoryFeedPage } from "@/features/seo/components/category-feed-page";
import {
  buildBreadcrumbJsonLd,
  JsonLdScript,
} from "@/features/seo/build-json-ld";
import { buildFeedPageMetadata } from "@/features/seo/build-page-metadata";
import { isCategoryLandingSlug } from "@/features/seo/sitemap-urls";
import { feedCategoryPath, feedPath, feedReturnPath, homePath } from "@/i18n/paths";
import type { Locale } from "@/i18n/routing";

/** ISR interval — keep in sync with ARTICLE_DETAIL_REVALIDATE_SECONDS */
export const revalidate = 120;

type SlugPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const resolvedLocale = locale as Locale;

  if (isCategoryLandingSlug(slug)) {
    const t = await getTranslations({ locale, namespace: "seo.category" });
    const tFeed = await getTranslations({ locale, namespace: "feed.categories" });
    const categoryLabel = tFeed(slug);
    const canonical = feedCategoryPath(resolvedLocale, slug);

    return buildFeedPageMetadata({
      locale: resolvedLocale,
      title: t("pageTitle", { category: categoryLabel }),
      description: t("metaDescription", { category: categoryLabel }),
      canonicalPath: canonical,
    });
  }

  const t = await getTranslations({ locale, namespace: "errors" });
  const result = await getArticleBySlug({ slug, locale: resolvedLocale });

  if (!result.ok) {
    if (result.error === "not_found") {
      return {
        title: `${t("articleNotFound")} | Veraz`,
        robots: { index: false, follow: false },
      };
    }

    return {
      title: "Veraz",
    };
  }

  return buildArticleDetailMetadata(result.data, getAppConfig().siteUrl, resolvedLocale);
}

export default async function NoticiasSlugPage({ params }: SlugPageProps) {
  const { slug, locale } = await params;
  const resolvedLocale = locale as Locale;

  if (isCategoryLandingSlug(slug)) {
    return <CategoryFeedPage locale={resolvedLocale} categorySlug={slug} />;
  }

  const result = await getArticleBySlug({ slug, locale: resolvedLocale });

  if (!result.ok) {
    if (result.error === "not_found") {
      notFound();
    }

    if (result.error === "not_configured" || result.error === "load_failed") {
      return <ArticleDetailError message={result.message} />;
    }

    notFound();
  }

  const siteUrl = getAppConfig().siteUrl;
  const article = result.data;
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tFeed = await getTranslations({ locale, namespace: "feed.categories" });

  const breadcrumb = buildBreadcrumbJsonLd(siteUrl, [
    { name: tNav("home"), path: homePath(resolvedLocale) },
    { name: tNav("news"), path: feedPath(resolvedLocale) },
    {
      name: tFeed(article.categorySlug),
      path: feedReturnPath(resolvedLocale, article.categorySlug),
    },
    { name: article.title, path: `${feedPath(resolvedLocale)}/${article.slug}` },
  ]);

  return (
    <>
      <ArticleJsonLd article={article} siteUrl={siteUrl} locale={resolvedLocale} />
      <JsonLdScript schema={breadcrumb} />
      <ArticleDetailView article={article} locale={resolvedLocale} />
    </>
  );
}
