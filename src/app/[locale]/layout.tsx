import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";

import { PostHogAnalytics } from "@/components/analytics/posthog-analytics";
import { HtmlLang } from "@/components/layout/html-lang";
import { SitePillNav } from "@/components/layout/site-pill-nav";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { getAnalyticsConfig } from "@/config/accessors";
import { routing, type Locale } from "@/i18n/routing";

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  icons: {
    icon: "/veraztrans.png",
    apple: "/veraztrans.png",
  },
};

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const analytics = getAnalyticsConfig();
  const posthogKey = analytics.publicId;
  const posthogHost = analytics.posthogHost;
  const posthogEnabled =
    analytics.enabled &&
    analytics.provider === "posthog" &&
    Boolean(posthogKey && posthogHost);

  const app = (
    <>
      <SitePillNav />
      {children}
    </>
  );

  return (
    <NextIntlClientProvider messages={messages}>
      <HtmlLang />
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
