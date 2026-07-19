/**
 * Structured RSS/Atom item extracted from XML — internal to ingestion boundary.
 */
export type RssRawItem = {
  id: string;
  title: string;
  link: string;
  description?: string;
  content?: string;
  publishedAt?: string;
  author?: string;
  categories?: ReadonlyArray<string>;
  heroImageUrl?: string;
};

export type RssFeedMetadata = {
  title?: string;
  link?: string;
  language?: string;
  format: "rss" | "atom";
};

export type RssFeedDocument = {
  metadata: RssFeedMetadata;
  items: ReadonlyArray<RssRawItem>;
};

/** Discriminated raw payload stored in ProviderPayload.raw for RSS. */
export type RssProviderRaw = {
  kind: "rss-item";
  item: RssRawItem;
  feed: RssFeedMetadata;
  feedUrl: string;
};
