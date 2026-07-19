import { getCacheConfig, getSchedulerConfig } from "@/config/accessors";
import type { NewsTopicSlug } from "@/features/news/classification/categories";
import { resolveFeedPageDescription } from "@/features/news/utils/feed-vertical-presets";
import { formatIntervalSpanish } from "@/features/news/utils/format-update-interval";

export function getFeedHeaderDescription(categorySlug?: NewsTopicSlug): string {
  const verticalDescription = resolveFeedPageDescription(categorySlug);
  if (verticalDescription) return verticalDescription;

  const { feedRevalidateSeconds } = getCacheConfig();
  const { ingestionIntervalSeconds } = getSchedulerConfig();

  const ingestionLabel = formatIntervalSpanish(ingestionIntervalSeconds);
  const refreshLabel = formatIntervalSpanish(feedRevalidateSeconds);

  return (
    `Lo esencial, ordenado por fecha. Cada titular enlaza a la fuente original. ` +
    `Las fuentes se revisan cada ${ingestionLabel}; el feed se actualiza cada ${refreshLabel}.`
  );
}
