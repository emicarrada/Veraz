/**
 * Concrete provider adapters — import only from composition root / Engine setup.
 * Features and app MUST NOT deep-import these modules.
 */

export { RSSProvider } from "@/lib/news-ingestion/providers/rss/rss-provider";
export { NewsAPIProvider } from "@/lib/news-ingestion/providers/newsapi/newsapi-provider";
export { GDELTProvider } from "@/lib/news-ingestion/providers/gdelt/gdelt-provider";
export { GuardianProvider } from "@/lib/news-ingestion/providers/guardian/guardian-provider";
export { ReutersProvider } from "@/lib/news-ingestion/providers/reuters/reuters-provider";
export { APNewsProvider } from "@/lib/news-ingestion/providers/ap-news/ap-news-provider";
export { CustomProvider } from "@/lib/news-ingestion/providers/custom/custom-provider";
