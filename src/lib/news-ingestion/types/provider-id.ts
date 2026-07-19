/**
 * Stable provider identifiers. Extensible without changing feature code.
 */
export type NewsProviderId =
  | "rss"
  | "newsapi"
  | "gdelt"
  | "guardian"
  | "reuters"
  | "ap-news"
  | "custom"
  | (string & {});

export const NEWS_PROVIDER_IDS = [
  "rss",
  "newsapi",
  "gdelt",
  "guardian",
  "reuters",
  "ap-news",
  "custom",
] as const satisfies ReadonlyArray<NewsProviderId>;

export type KnownNewsProviderId = (typeof NEWS_PROVIDER_IDS)[number];
