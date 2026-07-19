import { describe, expect, it } from "vitest";

import { ProviderParseFailureError } from "@/lib/news-ingestion/errors";
import {
  FETCHED_AT,
  SAMPLE_RSS_XML,
} from "@/lib/news-ingestion/providers/rss/__fixtures__/sample-rss.xml";
import { RssXmlParser } from "@/lib/news-ingestion/providers/rss/rss-xml-parser";

describe("RssXmlParser", () => {
  const parser = new RssXmlParser();

  it("parses RSS 2.0 items from XML", () => {
    const document = parser.parseFeed(SAMPLE_RSS_XML);

    expect(document.metadata.format).toBe("rss");
    expect(document.metadata.title).toBe("Veraz Test Feed");
    expect(document.metadata.language).toBe("en-us");
    expect(document.items).toHaveLength(4);
    expect(document.items[0]?.title).toBe("First Article");
    expect(document.items[0]?.link).toBe("https://example.com/articles/first");
    expect(document.items[0]?.author).toBe("Jane Doe");
    expect(document.items[0]?.categories).toEqual(["News"]);
    expect(document.items[0]?.heroImageUrl).toBe("https://example.com/image.jpg");
    expect(document.items[2]?.heroImageUrl).toBe("https://example.com/thumb.jpg");
    expect(document.items[3]?.heroImageUrl).toBe("https://example.com/inline.jpg");
  });

  it("converts XML to ProviderPayload records", () => {
    const payloads = parser.parseToPayloads(SAMPLE_RSS_XML, {
      sourceSlug: "test-source",
      feedUrl: "https://example.com/feed.xml",
      fetchedAt: FETCHED_AT,
    });

    expect(payloads).toHaveLength(4);
    expect(payloads[0]?.providerId).toBe("rss");
    expect(payloads[0]?.sourceSlug).toBe("test-source");
    expect(payloads[0]?.providerItemId).toBe("guid-first-article");
    expect(payloads[0]?.raw).toMatchObject({
      kind: "rss-item",
      feedUrl: "https://example.com/feed.xml",
    });
  });

  it("throws typed error for empty XML", () => {
    expect(() => parser.parseFeed("   ")).toThrow(ProviderParseFailureError);
  });

  it("throws typed error for unsupported format", () => {
    expect(() => parser.parseFeed("<html></html>")).toThrow(
      ProviderParseFailureError,
    );
  });
});
