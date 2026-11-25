import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { getAppConfig } from "@/config";
import { Section } from "@/components/ui/section";
import { Text } from "@/components/ui/text";
import { YesterdayCarousel } from "@/features/news/components/yesterday-carousel";
import { NewsAppShell } from "@/features/news/components/news-app-shell";
import { getYesterdayHighlights } from "@/features/news/services/get-yesterday-highlights";
import { openGraphLocale, SEO_OG_IMAGE, SEO_OG_IMAGE_HEIGHT, SEO_OG_IMAGE_WIDTH } from "@/features/seo/build-page-metadata";
import { staticPath } from "@/i18n/paths";
import { locales, type Locale } from "@/i18n/routing";

export const revalidate = 120;

type YesterdayPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: YesterdayPageProps): Promise<Metadata> {
  const { locale } = await params;
  const resolved = locale as Locale;
  const t = await getTranslations({ locale, namespace: "yesterday" });
  const { name, siteUrl } = getAppConfig();
  const canonical = staticPath(resolved, "/ayer");

  return {
    metadataBase: new URL(siteUrl),
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical,
      languages: Object.fromEntries(locales.map((code) => [code, staticPath(code, "/ayer")])),
    },
    openGraph: {
      type: "website",
      locale: openGraphLocale(resolved),
      url: canonical,
      siteName: name,
      title: t("title"),
      description: t("description"),
      images: [{ url: SEO_OG_IMAGE, width: SEO_OG_IMAGE_WIDTH, height: SEO_OG_IMAGE_HEIGHT, alt: name }],
    },
    robots: { index: true, follow: true },
  };
}

export default async function YesterdayPage({ params }: YesterdayPageProps) {
  const { locale } = await params;
  const t = await getTranslations("yesterday");
  const items = await getYesterdayHighlights(locale as Locale).catch(() => []);

  return (
    <NewsAppShell>
      <Section padding="md" containerSize="2xl">
        <header className="mb-6">
          <Text variant="h1" className="text-balance">
            {t("title")}
          </Text>
          <Text variant="caption" className="mt-2 hidden text-ink-muted sm:block">
            {t("description")}
          </Text>
          <ul className="mt-3 space-y-1 text-caption text-ink-muted sm:hidden">
            {(t.raw("mobileHelp") as string[]).map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </header>
        {items.length < 3 ? (
          <Text variant="body" className="text-ink-muted">
            {t("empty")}
          </Text>
        ) : (
          <YesterdayCarousel items={items} />
        )}
      </Section>
    </NewsAppShell>
  );
}
