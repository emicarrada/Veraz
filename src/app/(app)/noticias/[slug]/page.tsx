import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAppConfig } from "@/config/accessors";
import { ArticleDetailError } from "@/features/news/components/article-detail-view";
import { ArticleDetailView } from "@/features/news/components/article-detail-view";
import { ArticleJsonLd } from "@/features/news/components/article-json-ld";
import {
  buildArticleDetailMetadata,
  getArticleBySlug,
} from "@/features/news/services/get-article-by-slug";

/** ISR interval — keep in sync with ARTICLE_DETAIL_REVALIDATE_SECONDS */
export const revalidate = 120;

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getArticleBySlug({ slug });

  if (!result.ok) {
    if (result.error === "not_found") {
      return {
        title: "Artículo no encontrado | Veraz",
        robots: { index: false, follow: false },
      };
    }

    return {
      title: "Noticias | Veraz",
    };
  }

  return buildArticleDetailMetadata(result.data, getAppConfig().siteUrl);
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const result = await getArticleBySlug({ slug });

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
      <ArticleJsonLd article={result.data} siteUrl={siteUrl} />
      <ArticleDetailView article={result.data} />
    </>
  );
}
