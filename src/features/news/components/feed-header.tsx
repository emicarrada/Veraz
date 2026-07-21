import { getLocale, getTranslations } from "next-intl/server";

import type { NewsTopicSlug } from "@/features/news/classification/categories";
import { getTopicGroup } from "@/features/news/classification/categories";
import { Text } from "@/components/ui/text";
import {
  isPrestigiousFeedCategory,
  resolveFeedPageDescriptionKey,
  resolveFeedPageTitleKey,
  resolvePrestigiousSourcesForFeed,
} from "@/features/news/utils/feed-vertical-presets";
import type { Locale } from "@/i18n/routing";

export type FeedHeaderProps = {
  categorySlug?: NewsTopicSlug;
};

export async function FeedHeader({ categorySlug }: FeedHeaderProps) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("feed");
  const titleKey = resolveFeedPageTitleKey(categorySlug);
  const title =
    titleKey === "title" || titleKey === "finanzasTitle" || titleKey === "tecnologiaTitle"
      ? t(titleKey)
      : t(titleKey);

  const descriptionKey = resolveFeedPageDescriptionKey(categorySlug);
  const description = descriptionKey ? t(descriptionKey) : t("defaultDescription");

  const prestigiousSources = resolvePrestigiousSourcesForFeed(categorySlug, locale);
  const showTrustBanner = isPrestigiousFeedCategory(categorySlug);
  const group = categorySlug ? getTopicGroup(categorySlug) : undefined;
  const showLanguageDisclosure =
    locale === "es" && (group === "economia" || group === "tecnologia");

  return (
    <header className="mb-8 border-b border-border pb-6">
      <Text variant="h1" className="text-balance">
        {title}
      </Text>
      <Text variant="body" className="mt-2 max-w-3xl text-ink-secondary">
        {description}
      </Text>

      {showLanguageDisclosure ? (
        <div className="mt-5 max-w-3xl rounded-lg border border-accent/30 bg-surface px-4 py-3">
          <Text variant="small" className="text-ink-secondary">
            {group === "economia"
              ? t("languageDisclosureFinance")
              : t("languageDisclosureTech")}
          </Text>
        </div>
      ) : null}

      {showTrustBanner && prestigiousSources && prestigiousSources.length > 0 ? (
        <div className="mt-5 max-w-3xl rounded-lg border border-border bg-surface px-4 py-3">
          <Text variant="caption" className="font-medium text-ink">
            {t("trustBannerTitle")}
          </Text>
          <ul className="mt-2 flex flex-wrap gap-2">
            {prestigiousSources.map((source) => (
              <li key={source.slug}>
                <Text
                  as="span"
                  variant="small"
                  className="rounded-md border border-border bg-surface-elevated px-2 py-1 text-ink-secondary"
                >
                  {source.label}
                </Text>
              </li>
            ))}
          </ul>
          <Text variant="small" className="mt-3 text-ink-muted">
            {t("trustBannerNote")}
          </Text>
        </div>
      ) : null}
    </header>
  );
}
