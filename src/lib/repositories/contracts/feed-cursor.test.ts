import { describe, expect, it } from "vitest";

import type { ArticleId } from "@/domain/shared/ids";
import {
  decodeFeedCursor,
  encodeFeedCursor,
} from "@/lib/repositories/contracts/feed-cursor";

describe("feed cursor", () => {
  const cursor = {
    publishedAt: "2026-07-16T12:00:00.000Z",
    ingestedAt: "2026-07-17T00:00:00.000Z",
    id: "article-1" as ArticleId,
  };

  it("round-trips cursor encoding", () => {
    const encoded = encodeFeedCursor(cursor);
    expect(decodeFeedCursor(encoded)).toEqual(cursor);
  });

  it("returns null for invalid cursor", () => {
    expect(decodeFeedCursor("not-valid")).toBeNull();
  });
});
