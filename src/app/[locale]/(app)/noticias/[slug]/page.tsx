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
import type { Locale } from "@/i18n/routing";

/** ISR interval — keep in sync with ARTICLE_DETAIL_REVALIDATE_SECONDS */
export const revalidate = 120;

type ArticlePageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: "errors" });
  const result = await getArticleBySlug({ slug, locale: locale as Locale });

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

  return buildArticleDetailMetadata(result.data, getAppConfig().siteUrl, locale as Locale);
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug, locale } = await params;
  const result = await getArticleBySlug({ slug, locale: locale as Locale });

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

  return (
    <>
      <ArticleJsonLd article={result.data} siteUrl={siteUrl} locale={locale as Locale} />
      <ArticleDetailView article={result.data} />
    </>
  );
}
