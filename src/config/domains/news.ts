import type { NewsTopicGroup } from "@/features/news/classification/categories";

/**
 * News / ingestion configuration (declarative — no pipeline logic).
 */
export type RssFeedVertical = "finance" | "tech" | "sports" | "culture" | "general";

export type RssFeedConfig = {
  sourceSlug: string;
  feedUrl: string;
  defaultLanguageCode?: string;
  /** Fallback topic when keywords/RSS labels classify as general. */
  defaultTopicGroup?: NewsTopicGroup;
  /** Editorial vertical metadata (docs/UI). */
  primaryVertical?: RssFeedVertical;
};

export type NewsConfig = {
  /** Master switch for ingestion jobs (future). Default off. */
  ingestionEnabled: boolean;
  /** Max items per discover batch (future scheduler). */
  discoverBatchLimit: number;
  /** Max parallel fetch workers per provider (future). */
  fetchConcurrency: number;
  /** Default publish without waiting for AI enrichment. */
  publishWithoutEnrichment: boolean;
  /** RSS feed endpoints keyed by source slug — from Config Engine only. */
  rss: {
    feeds: ReadonlyArray<RssFeedConfig>;
  };
};

export const DEFAULT_NEWS_CONFIG: NewsConfig = {
  ingestionEnabled: false,
  discoverBatchLimit: 50,
  fetchConcurrency: 4,
  publishWithoutEnrichment: true,
  rss: {
    feeds: [],
  },
};
