import { beforeEach, describe, expect, it, vi } from "vitest";

import { resetConfigCache } from "@/config/accessors";
import { resetEnvSnapshot } from "@/config/env";
import {
  FETCHED_AT,
  SAMPLE_RSS_XML,
} from "@/lib/news-ingestion/providers/rss/__fixtures__/sample-rss.xml";
import { RssFeedFetcher } from "@/lib/news-ingestion/providers/rss/rss-feed-fetcher";
import { RSSProvider } from "@/lib/news-ingestion/providers/rss/rss-provider";

function seedRssConfig() {
  process.env.NEWS_RSS_FEEDS = JSON.stringify([
    {
      sourceSlug: "test-source",
      feedUrl: "https://example.com/feed.xml",
      defaultLanguageCode: "en",
    },
  ]);
  resetEnvSnapshot();
  resetConfigCache();
}

describe("RSSProvider", () => {
  beforeEach(() => {
    seedRssConfig();
  });

  it("discovers candidates from fetched XML", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      xml: SAMPLE_RSS_XML,
      fetchedAt: FETCHED_AT,
      contentType: "application/rss+xml",
    });

    const fetcher = { fetch: fetchMock } as unknown as RssFeedFetcher;
    const provider = new RSSProvider({ fetcher });

    const result = await provider.discover({
      providerId: "rss",
      sourceSlug: "test-source",
      limit: 2,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(fetchMock).toHaveBeenCalledWith("https://example.com/feed.xml");
    expect(result.data.candidates).toHaveLength(2);
    expect(result.data.candidates[0]?.providerItemId).toBe("guid-first-article");
    expect(result.data.candidates[0]?.hintTitle).toBe("First Article");
  });

  it("fetches a single item payload by candidate id", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      xml: SAMPLE_RSS_XML,
      fetchedAt: FETCHED_AT,
    });

    const provider = new RSSProvider({
      fetcher: { fetch: fetchMock } as unknown as RssFeedFetcher,
    });

    const result = await provider.fetch({
      candidate: {
        providerId: "rss",
        providerItemId: "guid-second-article",
        sourceSlug: "test-source",
        discoveredUrl: "https://example.com/articles/second",
        discoveredAt: FETCHED_AT,
      },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.payload.providerItemId).toBe("guid-second-article");
    expect(result.data.payload.raw).toMatchObject({ kind: "rss-item" });
  });

  it("returns typed error when feed URL is not configured", async () => {
    process.env.NEWS_RSS_FEEDS = "[]";
    resetEnvSnapshot();
    resetConfigCache();

    const provider = new RSSProvider({
      fetcher: {
        fetch: vi.fn(),
      } as unknown as RssFeedFetcher,
    });

    const result = await provider.discover({
      providerId: "rss",
      sourceSlug: "missing-source",
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("provider_unconfigured");
  });

  it("allows endpoint override without config entry", async () => {
    process.env.NEWS_RSS_FEEDS = "[]";
    resetEnvSnapshot();
    resetConfigCache();

    const fetchMock = vi.fn().mockResolvedValue({
      xml: SAMPLE_RSS_XML,
      fetchedAt: FETCHED_AT,
    });

    const provider = new RSSProvider({
      fetcher: { fetch: fetchMock } as unknown as RssFeedFetcher,
    });

    const result = await provider.discover({
      providerId: "rss",
      sourceSlug: "override-source",
      endpoint: "https://override.example/feed.xml",
      limit: 1,
    });

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith("https://override.example/feed.xml");
  });
});
