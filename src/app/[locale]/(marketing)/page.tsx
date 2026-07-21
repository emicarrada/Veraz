import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { LandingPage } from "@/components/marketing/landing";
import { getAppConfig } from "@/config";
import { homePath } from "@/i18n/paths";
import { locales, type Locale } from "@/i18n/routing";

const { name: SITE_NAME, tagline: SITE_TAGLINE, siteUrl } = getAppConfig();

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
      languages: Object.fromEntries(
        locales.map((code) => [code, homePath(code)]),
      ),
    },
    openGraph: {
      type: "website",
      locale: locale === "en" ? "en_US" : "es_ES",
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
    robots: {
      index: true,
      follow: true,
    },
  };
}

async function JsonLd({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "landing" });
  const description = t("metaDescription");

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    slogan: SITE_TAGLINE,
    description,
    url: siteUrl,
    logo: `${siteUrl}/veraznegrologo.png`,
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${siteUrl}${homePath(locale)}`,
    description,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    inLanguage: locale,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}

export default async function MarketingHomePage({ params }: HomePageProps) {
  const { locale } = await params;

  return (
    <>
      <JsonLd locale={locale as Locale} />
      <LandingPage />
    </>
  );
}
