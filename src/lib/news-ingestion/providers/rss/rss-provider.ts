import {
  InvalidIngestionInputError,
  ProviderUnconfiguredError,
  UnknownIngestionError,
} from "@/lib/news-ingestion/errors";
import { IngestionEngineError } from "@/lib/news-ingestion/errors/base";
import { getRssFeedBySourceSlug } from "@/config/accessors";
import type { NewsProvider } from "@/lib/news-ingestion/contracts/news-provider";
import type { ProviderCapability } from "@/lib/news-ingestion/types/capabilities";
import type {
  DiscoverInput,
  FetchInput,
  IngestionCandidate,
} from "@/lib/news-ingestion/types/article";
import type {
  DiscoverResult,
  FetchResult,
  IngestionResult,
} from "@/lib/news-ingestion/types/results";
import type { ProviderHealth } from "@/lib/news-ingestion/types/health";
import { RssFeedFetcher } from "@/lib/news-ingestion/providers/rss/rss-feed-fetcher";
import { RssXmlParser } from "@/lib/news-ingestion/providers/rss/rss-xml-parser";
import { ingestionFail, ingestionOk } from "@/lib/news-ingestion/utils/ingestion-result";
import { urlFingerprint } from "@/lib/news-ingestion/utils/url-fingerprint";
import { isExcludedFeedArticleUrl } from "@/lib/news-ingestion/utils/feed-url-policy";

const RSS_CAPABILITIES = ["discover", "fetch", "health_check"] as const satisfies ReadonlyArray<ProviderCapability>;

export type RSSProviderOptions = {
  fetcher?: RssFeedFetcher;
  parser?: RssXmlParser;
};

/**
 * RSS / Atom provider — fetches XML and delegates parsing to RssXmlParser.
 */
export class RSSProvider implements NewsProvider {
  readonly id = "rss" as const;
  readonly displayName = "RSS / Atom";

  private readonly fetcher: RssFeedFetcher;
  private readonly parser: RssXmlParser;

  constructor(options: RSSProviderOptions = {}) {
    this.fetcher = options.fetcher ?? new RssFeedFetcher();
    this.parser = options.parser ?? new RssXmlParser();
  }

  capabilities(): ReadonlyArray<ProviderCapability> {
    return RSS_CAPABILITIES;
  }

  async discover(input: DiscoverInput): Promise<DiscoverResult> {
    try {
      const feedUrl = this.resolveFeedUrl(input);
      const { xml, fetchedAt } = await this.fetcher.fetch(feedUrl);
      const document = this.parser.parseFeed(xml);
      const limit = input.limit ?? document.items.length;

      const candidates: IngestionCandidate[] = document.items
        .slice(0, limit)
        .filter((item) => !isExcludedFeedArticleUrl(item.link))
        .map((item) => ({
          providerId: this.id,
          providerItemId: item.id || urlFingerprint(item.link),
          sourceSlug: input.sourceSlug,
          discoveredUrl: item.link,
          discoveredAt: fetchedAt,
          hintTitle: item.title,
          ...(item.publishedAt ? { hintPublishedAt: item.publishedAt } : {}),
        }));

      return ingestionOk({ candidates });
    } catch (error) {
      return this.toFailure(error);
    }
  }

  async fetch(input: FetchInput): Promise<FetchResult> {
    try {
      const feedUrl = this.resolveFeedUrl({
        providerId: this.id,
        sourceSlug: input.candidate.sourceSlug,
      });

      const { xml, fetchedAt } = await this.fetcher.fetch(feedUrl);
      const payloads = this.parser.parseToPayloads(xml, {
        sourceSlug: input.candidate.sourceSlug,
        feedUrl,
        fetchedAt,
      });

      const payload = payloads.find(
        (entry) => entry.providerItemId === input.candidate.providerItemId,
      );

      if (!payload) {
        return ingestionFail(
          new InvalidIngestionInputError(
            `RSS item "${input.candidate.providerItemId}" not found in feed.`,
          ),
        );
      }

      return ingestionOk({ payload });
    } catch (error) {
      return this.toFailure(error);
    }
  }

  async healthCheck(): Promise<ProviderHealth> {
    return {
      providerId: this.id,
      status: "healthy",
      checkedAt: new Date().toISOString(),
      detail: "RSS provider ready.",
    };
  }

  private resolveFeedUrl(input: DiscoverInput): string {
    if (input.endpoint?.trim()) {
      return input.endpoint.trim();
    }

    const feed = getRssFeedBySourceSlug(input.sourceSlug);
    if (!feed?.feedUrl) {
      throw new ProviderUnconfiguredError(
        this.id,
        `No RSS feed URL configured for source "${input.sourceSlug}".`,
      );
    }

    return feed.feedUrl;
  }

  private toFailure<T>(error: unknown): IngestionResult<T> {
    if (error instanceof IngestionEngineError) {
      return ingestionFail(error);
    }
    return ingestionFail(
      new UnknownIngestionError(
        error instanceof Error ? error.message : "RSS provider operation failed.",
        { cause: error },
      ),
    );
  }
}
