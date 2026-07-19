/**
 * RSS provider module — fetch, parse, normalize boundary.
 */
export { RSSProvider, type RSSProviderOptions } from "@/lib/news-ingestion/providers/rss/rss-provider";
export { RssFeedFetcher, type RssFeedFetchResult } from "@/lib/news-ingestion/providers/rss/rss-feed-fetcher";
export { RssXmlParser, type RssParseContext } from "@/lib/news-ingestion/providers/rss/rss-xml-parser";
export type {
  RssRawItem,
  RssFeedDocument,
  RssFeedMetadata,
  RssProviderRaw,
} from "@/lib/news-ingestion/providers/rss/rss-types";
