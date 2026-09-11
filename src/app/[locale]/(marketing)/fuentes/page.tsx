import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { StaticPageShell } from "@/components/marketing/static-page-shell";
import { RSS_FEED_CATALOG } from "@/config/domains/rss-feed-catalog";
import { getAppConfig } from "@/config";
import { buildStaticPageMetadata } from "@/features/seo/build-page-metadata";
import type { Locale } from "@/i18n/routing";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "static.sources" });

  return buildStaticPageMetadata({
    locale: locale as Locale,
    segment: "fuentes",
    title: t("title"),
    description: t("metaDescription"),
  });
}

export default async function FuentesPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "static.sources" });
  const { name } = getAppConfig();

  const grouped = RSS_FEED_CATALOG.reduce<Record<string, typeof RSS_FEED_CATALOG>>((acc, entry) => {
    const key = entry.primaryVertical ?? "general";
    acc[key] = [...(acc[key] ?? []), entry];
    return acc;
  }, {});

  const verticalOrder = ["general", "finance", "tech", "sports", "culture"] as const;

  return (
    <StaticPageShell title={t("pageTitle")} description={t("pageDescription", { name })}>
      <p>{t("intro", { name })}</p>

      {verticalOrder.map((vertical) => {
        const entries = grouped[vertical];
        if (!entries?.length) return null;

        return (
          <section key={vertical}>
            <h2>{t(`sections.${vertical}.title`)}</h2>
            <p>{t(`sections.${vertical}.body`)}</p>
            <ul>
              {entries.map((entry) => (
                <li key={entry.sourceSlug}>
                  <strong>{entry.sourceSlug}</strong>
                  {" — "}
                  <a href={entry.feedUrl} rel="noopener noreferrer" target="_blank">
                    {entry.feedUrl}
                  </a>
                  {entry.defaultLanguageCode ? ` (${entry.defaultLanguageCode})` : null}
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <p>{t("methodologyNote")}</p>
    </StaticPageShell>
  );
}
