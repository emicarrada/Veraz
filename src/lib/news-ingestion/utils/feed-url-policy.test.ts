import { describe, expect, it } from "vitest";

import { isExcludedFeedArticleUrl } from "@/lib/news-ingestion/utils/feed-url-policy";

describe("isExcludedFeedArticleUrl", () => {
  it("excludes BBC Mundo live blog URLs", () => {
    expect(
      isExcludedFeedArticleUrl(
        "https://www.bbc.co.uk/mundo/live/cdejeeez4y2t?at_medium=RSS&at_campaign=rss",
      ),
    ).toBe(true);
  });

  it("allows standard article URLs", () => {
    expect(isExcludedFeedArticleUrl("https://www.bbc.co.uk/mundo/articles/example")).toBe(
      false,
    );
  });
});
