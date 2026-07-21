import { describe, expect, it } from "vitest";

import {
  RSS_FEED_CATALOG,
  getCatalogFeedsByVertical,
  isNewsTopicGroup,
  toRssFeedConfig,
} from "@/config/domains/rss-feed-catalog";
import { isNewsTopicGroup as isNewsTopicGroupFromCategories } from "@/features/news/classification/categories";

describe("RSS_FEED_CATALOG", () => {
  it("includes finance, tech, sports, and culture verticals", () => {
    expect(getCatalogFeedsByVertical("finance").length).toBe(5);
    expect(getCatalogFeedsByVertical("tech").length).toBe(7);
    expect(getCatalogFeedsByVertical("sports").length).toBe(3);
    expect(getCatalogFeedsByVertical("culture").length).toBe(3);
  });

  it("maps catalog entries to RssFeedConfig", () => {
    const [first] = RSS_FEED_CATALOG;
    expect(first).toBeDefined();
    const config = toRssFeedConfig(first!);
    expect(config.sourceSlug).toBe(first!.sourceSlug);
    expect(config.feedUrl).toBe(first!.feedUrl);
    expect(config).not.toHaveProperty("label");
  });

  it("validates topic groups", () => {
    expect(isNewsTopicGroup("economia")).toBe(true);
    expect(isNewsTopicGroup("mercados")).toBe(false);
    expect(isNewsTopicGroup("invalid")).toBe(false);
  });
});

describe("isNewsTopicGroup re-export", () => {
  it("matches categories helper", () => {
    expect(isNewsTopicGroup("tecnologia")).toBe(isNewsTopicGroupFromCategories("tecnologia"));
  });
});
