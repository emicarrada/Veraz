import { describe, expect, it } from "vitest";

import { RssFeedFetcher } from "@/lib/news-ingestion/providers/rss/rss-feed-fetcher";

const RSS = `<?xml version="1.0"?><rss version="2.0"><channel><title>ESPN</title></channel></rss>`;

describe("RssFeedFetcher", () => {
  it("accepts an RSS body when the server labels it text/html", async () => {
    const fetcher = new RssFeedFetcher({
      fetchImpl: async () =>
        new Response(RSS, {
          status: 200,
          headers: { "content-type": "text/html; charset=UTF-8" },
        }),
    });

    const result = await fetcher.fetch("https://www.espn.com.mx/espn/rss/news");
    expect(result.xml).toContain("<rss");
  });

  it("rejects a real HTML page", async () => {
    const fetcher = new RssFeedFetcher({
      fetchImpl: async () =>
        new Response("<!doctype html><html></html>", {
          status: 200,
          headers: { "content-type": "text/html" },
        }),
    });

    await expect(fetcher.fetch("https://example.com/feed")).rejects.toThrow(
      /Unsupported feed content type/,
    );
  });
});
