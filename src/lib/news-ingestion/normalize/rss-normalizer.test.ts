import { describe, expect, it } from "vitest";

import { RssNormalizer } from "@/lib/news-ingestion/normalize/rss-normalizer";
import {
  FETCHED_AT,
  SAMPLE_RSS_XML,
} from "@/lib/news-ingestion/providers/rss/__fixtures__/sample-rss.xml";
import { RssXmlParser } from "@/lib/news-ingestion/providers/rss/rss-xml-parser";

describe("RssNormalizer", () => {
  const parser = new RssXmlParser();
  const normalizer = new RssNormalizer();

  const context = {
    runId: "test-run",
    state: {
      runId: "test-run",
      candidateId: "guid-first-article",
      status: "fetched" as const,
      providerId: "rss",
      sourceSlug: "test-source",
      updatedAt: FETCHED_AT,
      retryCount: 0,
    },
  };

  it("converts RSS ProviderPayload to NormalizedArticle", async () => {
    const [payload] = parser.parseToPayloads(SAMPLE_RSS_XML, {
      sourceSlug: "test-source",
      feedUrl: "https://example.com/feed.xml",
      fetchedAt: FETCHED_AT,
    });

    expect(payload).toBeDefined();

    const result = await normalizer.normalize(payload!, context);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.providerId).toBe("rss");
    expect(result.data.sourceSlug).toBe("test-source");
    expect(result.data.title).toBe("First Article");
    expect(result.data.canonicalUrl).toBe("https://example.com/articles/first");
    expect(result.data.excerpt).toBe("Hello world");
    expect(result.data.byline).toBe("Jane Doe");
    expect(result.data.languageCode).toBe("en");
    expect(result.data.contentFormat).toBe("mixed");
    expect(result.data.heroImageUrl).toBe("https://example.com/image.jpg");
    expect(result.data.references?.[0]?.kind).toBe("original");
    expect(result.data.urlFingerprint).toHaveLength(64);
  });

  it("uses the longest plain-text field for excerpt and bodyExcerpt fallback", async () => {
    const payloads = parser.parseToPayloads(SAMPLE_RSS_XML, {
      sourceSlug: "test-source",
      feedUrl: "https://example.com/feed.xml",
      fetchedAt: FETCHED_AT,
    });

    const richPayload = payloads.find(
      (entry) => entry.providerItemId === "guid-inline-image-article",
    );
    expect(richPayload).toBeDefined();

    const result = await normalizer.normalize(richPayload!, context);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.excerpt).toBe("Lead text");
    expect(result.data.heroImageUrl).toBe("https://example.com/inline.jpg");
  });

  it("returns typed failure for invalid raw payload", async () => {
    const result = await normalizer.normalize(
      {
        providerId: "rss",
        providerItemId: "x",
        sourceSlug: "test-source",
        fetchedAt: FETCHED_AT,
        raw: { invalid: true },
      },
      context,
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("normalization_failed");
  });
});
