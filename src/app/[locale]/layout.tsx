import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";

import { PostHogAnalytics } from "@/components/analytics/posthog-analytics";
import { HtmlLang } from "@/components/layout/html-lang";
import { SitePillNav } from "@/components/layout/site-pill-nav";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { getAnalyticsConfig, getAppConfig } from "@/config/accessors";
import { getAuthSession } from "@/features/auth";
import { indexableRobots, buildSiteVerificationMetadata } from "@/features/seo/build-page-metadata";
import { SiteGraphJsonLd } from "@/features/seo/components/site-graph";
import { routing, type Locale } from "@/i18n/routing";

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { name, siteUrl } = getAppConfig();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: name,
      template: `%s · ${name}`,
    },
    applicationName: name,
    verification: buildSiteVerificationMetadata(),
    robots: indexableRobots(true),
    other:
      locale === "es"
        ? {
            "content-language": "es-MX",
            "geo.region": "MX",
            "geo.placename": "México",
          }
        : {
            "content-language": "en",
          },
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const session = await getAuthSession();
  const analytics = getAnalyticsConfig();
  const posthogKey = analytics.publicId;
  const posthogHost = analytics.posthogHost;
  const posthogEnabled =
    analytics.enabled &&
    analytics.provider === "posthog" &&
    Boolean(posthogKey && posthogHost);

  const app = (
    <>
      <SitePillNav accountLabel={session?.displayName ?? session?.email ?? null} />
      {children}
    </>
  );

  return (
    <NextIntlClientProvider messages={messages}>
      <HtmlLang />
      <SiteGraphJsonLd locale={locale as Locale} />
      <ThemeProvider defaultTheme="dark">
        {posthogEnabled && posthogKey && posthogHost ? (
          <PostHogAnalytics apiKey={posthogKey} apiHost={posthogHost}>
            {app}
          </PostHogAnalytics>
        ) : (
          app
        )}
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
