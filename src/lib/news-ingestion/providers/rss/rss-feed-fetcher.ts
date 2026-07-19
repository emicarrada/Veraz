import {
  ProviderNotFoundError,
  ProviderParseFailureError,
  ProviderTimeoutError,
  ProviderUnavailableError,
} from "@/lib/news-ingestion/errors";
import type { NewsProviderId } from "@/lib/news-ingestion/types/provider-id";

const RSS_PROVIDER_ID: NewsProviderId = "rss";

export type RssFeedFetchResult = {
  xml: string;
  contentType?: string;
  fetchedAt: string;
};

export type RssFeedFetcherOptions = {
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

const DEFAULT_TIMEOUT_MS = 15_000;

/**
 * Downloads RSS/Atom XML from a public feed URL.
 * Responsible only for HTTP fetch — no parsing.
 */
export class RssFeedFetcher {
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: RssFeedFetcherOptions = {}) {
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async fetch(feedUrl: string): Promise<RssFeedFetchResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchImpl(feedUrl, {
        method: "GET",
        headers: {
          Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
          "User-Agent": "Veraz-RSS-Ingestion/1.0",
        },
        signal: controller.signal,
      });

      if (response.status === 404) {
        throw new ProviderNotFoundError(
          RSS_PROVIDER_ID,
          `Feed not found: ${feedUrl}`,
        );
      }

      if (!response.ok) {
        throw new ProviderUnavailableError(
          RSS_PROVIDER_ID,
          `Feed request failed with status ${response.status}.`,
        );
      }

      const xml = await response.text();
      if (!xml.trim()) {
        throw new ProviderParseFailureError(
          RSS_PROVIDER_ID,
          "Feed response body is empty.",
        );
      }

      return {
        xml,
        contentType: response.headers.get("content-type") ?? undefined,
        fetchedAt: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof ProviderNotFoundError) throw error;
      if (error instanceof ProviderUnavailableError) throw error;
      if (error instanceof ProviderParseFailureError) throw error;

      if (error instanceof Error && error.name === "AbortError") {
        throw new ProviderTimeoutError(
          RSS_PROVIDER_ID,
          `Feed request timed out after ${this.timeoutMs}ms.`,
        );
      }

      throw new ProviderUnavailableError(
        RSS_PROVIDER_ID,
        error instanceof Error ? error.message : "Feed request failed.",
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}
