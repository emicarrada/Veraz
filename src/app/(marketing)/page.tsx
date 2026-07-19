import type { Metadata } from "next";

import { LandingPage } from "@/components/marketing/landing";
import { getAppConfig } from "@/config";

const SITE_DESCRIPTION =
  "Noticias agregadas de fuentes de referencia, con trazabilidad a la publicación original. Informar sin influenciar.";

const { name: SITE_NAME, tagline: SITE_TAGLINE, siteUrl } = getAppConfig();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Veraz",
    "noticias",
    "finanzas",
    "tecnología",
    "información verificable",
    "fuentes de referencia",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "/",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/veraznegrologo.png",
        width: 1200,
        height: 630,
        alt: "Veraz",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: ["/veraznegrologo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

function JsonLd() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    slogan: SITE_TAGLINE,
    description: SITE_DESCRIPTION,
    url: siteUrl,
    logo: `${siteUrl}/veraznegrologo.png`,
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl,
    description: SITE_DESCRIPTION,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    inLanguage: "es",
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

export default function MarketingHomePage() {
  return (
    <>
      <JsonLd />
      <LandingPage />
    </>
  );
}
