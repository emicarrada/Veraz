import { getLocale, getTranslations } from "next-intl/server";

import type { NewsTopicSlug } from "@/features/news/classification/categories";
import { Text } from "@/components/ui/text";
import { Link } from "@/i18n/navigation";
import {
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
  const title = t(resolveFeedPageTitleKey(categorySlug));
  const prestigiousSources = resolvePrestigiousSourcesForFeed(categorySlug, locale);

  return (
    <header className="mb-6 border-b border-border pb-4">
      <Text variant="h1" className="text-balance">
        {title}
      </Text>
      {categorySlug ? null : (
        <Link
          href="/ayer"
          className="mt-3 inline-flex h-8 items-center rounded-md border border-border bg-surface px-3 text-small font-medium text-ink veraz-transition veraz-focus-ring hover:bg-surface-muted"
        >
          {t("yesterdayLink")}
        </Link>
      )}
      {prestigiousSources && prestigiousSources.length > 0 ? (
        <p className="mt-2 text-small text-ink-muted">
          {prestigiousSources.map((source) => source.label).join(" · ")}
        </p>
      ) : null}
    </header>
  );
}
