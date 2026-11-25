import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { LandingPage } from "@/components/marketing/landing";
import { getAppConfig } from "@/config";
import { getLandingPhotoRing } from "@/features/news";
import { homePath } from "@/i18n/paths";
import type { Locale } from "@/i18n/routing";
import { indexableRobots, openGraphLocale, withRegionalAlternates } from "@/features/seo/build-page-metadata";

const { name: SITE_NAME, tagline: SITE_TAGLINE, siteUrl } = getAppConfig();

/** Keep in sync with DEFAULT_CACHE_CONFIG.feedRevalidateSeconds. */
export const revalidate = 120;

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing" });
  const description = t("metaDescription");
  const canonical = homePath(locale as Locale);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${SITE_NAME} — ${SITE_TAGLINE}`,
      template: `%s · ${SITE_NAME}`,
    },
    description,
    applicationName: SITE_NAME,
    keywords: t("keywords").split(", "),
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    alternates: {
      canonical,
      languages: withRegionalAlternates({
        es: homePath("es"),
        en: homePath("en"),
      }),
    },
    openGraph: {
      type: "website",
      locale: openGraphLocale(locale as Locale),
      url: canonical,
      siteName: SITE_NAME,
      title: `${SITE_NAME} — ${SITE_TAGLINE}`,
      description,
      images: [
        {
          url: "/veraznegrologo.png",
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE_NAME} — ${SITE_TAGLINE}`,
      description,
      images: ["/veraznegrologo.png"],
    },
    robots: indexableRobots(true),
  };
}

export default async function MarketingHomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const ringItems = await getLandingPhotoRing(locale as Locale).catch(() => []);

  return <LandingPage ringItems={ringItems} />;
}
