import type { NewsTopicSlug } from "@/features/news/classification/categories";
import { Text } from "@/components/ui/text";
import { getFeedHeaderDescription } from "@/features/news/utils/get-feed-header-description";
import {
  isPrestigiousFeedCategory,
  resolveFeedPageTitle,
  resolvePrestigiousSourcesForFeed,
} from "@/features/news/utils/feed-vertical-presets";

export type FeedHeaderProps = {
  categorySlug?: NewsTopicSlug;
};

export function FeedHeader({ categorySlug }: FeedHeaderProps) {
  const description = getFeedHeaderDescription(categorySlug);
  const title = resolveFeedPageTitle(categorySlug);
  const prestigiousSources = resolvePrestigiousSourcesForFeed(categorySlug);
  const showTrustBanner = isPrestigiousFeedCategory(categorySlug);

  return (
    <header className="mb-8 border-b border-border pb-6">
      <Text variant="h1" className="text-balance">
        {title}
      </Text>
      <Text variant="body" className="mt-2 max-w-3xl text-ink-secondary">
        {description}
      </Text>

      {showTrustBanner && prestigiousSources && prestigiousSources.length > 0 ? (
        <div className="mt-5 max-w-3xl rounded-lg border border-border bg-surface px-4 py-3">
          <Text variant="caption" className="font-medium text-ink">
            Fuentes de referencia en esta clasificación
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
            Contenido trazable a la fuente original. Veraz agrega y ordena; no redacta ni
            reinterpreta los hechos.
          </Text>
        </div>
      ) : null}
    </header>
  );
}
