import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { NewsFeedPage } from "@/features/news/components/news-feed-page";
import { feedPath } from "@/i18n/paths";
import type { Locale } from "@/i18n/routing";

/** ISR interval — keep in sync with DEFAULT_CACHE_CONFIG.feedRevalidateSeconds */
export const revalidate = 120;

type NoticiasPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; categoria?: string }>;
};

export async function generateMetadata({ params }: NoticiasPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "feed" });
  const canonical = feedPath(locale as Locale);

  return {
    title: `${t("title")} | Veraz`,
    description: t("defaultDescription"),
    openGraph: {
      title: `${t("title")} | Veraz`,
      description: t("defaultDescription"),
      type: "website",
    },
    alternates: {
      canonical,
      languages: {
        es: feedPath("es"),
        en: feedPath("en"),
      },
    },
  };
}

export default async function NoticiasPage({ searchParams }: NoticiasPageProps) {
  const params = await searchParams;

  return <NewsFeedPage search={params.q} categorySlug={params.categoria} />;
}
