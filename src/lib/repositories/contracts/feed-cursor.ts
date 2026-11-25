import type { ArticleId } from "@/domain/shared/ids";

import type { FeedLane } from "@/lib/repositories/contracts/feed-lane";

export type FeedCursor = {
  publishedAt: string;
  ingestedAt: string;
  id: ArticleId;
  /** Set when the main feed is ordered by country and photo, then time. */
  lane?: FeedLane;
  /** 0 = the outlet's own sharp photo. Used when the feed is not split by country. */
  imageRank?: 0 | 1;
};

export function encodeFeedCursor(cursor: FeedCursor): string {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

type LegacyFeedCursor = {
  publishedAt: string;
  id: ArticleId;
  ingestedAt?: string;
  lane?: unknown;
  imageRank?: unknown;
};

export function decodeFeedCursor(raw: string): FeedCursor | null {
  try {
    const parsed: unknown = JSON.parse(
      Buffer.from(raw, "base64url").toString("utf8"),
    );

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof (parsed as LegacyFeedCursor).publishedAt !== "string" ||
      typeof (parsed as LegacyFeedCursor).id !== "string"
    ) {
      return null;
    }

    const legacy = parsed as LegacyFeedCursor;

    const lane =
      legacy.lane === 0 ||
      legacy.lane === 1 ||
      legacy.lane === 2 ||
      legacy.lane === 3 ||
      legacy.lane === 4 ||
      legacy.lane === 5
        ? legacy.lane
        : undefined;
    const imageRank = legacy.imageRank === 0 || legacy.imageRank === 1 ? legacy.imageRank : undefined;

    return {
      publishedAt: legacy.publishedAt,
      ingestedAt: legacy.ingestedAt ?? legacy.publishedAt,
      id: legacy.id,
      ...(lane !== undefined ? { lane } : {}),
      ...(imageRank !== undefined ? { imageRank } : {}),
    };
  } catch {
    return null;
  }
}
