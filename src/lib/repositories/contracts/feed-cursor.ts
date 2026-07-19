import type { ArticleId } from "@/domain/shared/ids";

export type FeedCursor = {
  publishedAt: string;
  ingestedAt: string;
  id: ArticleId;
};

export function encodeFeedCursor(cursor: FeedCursor): string {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

type LegacyFeedCursor = {
  publishedAt: string;
  id: ArticleId;
  ingestedAt?: string;
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

    return {
      publishedAt: legacy.publishedAt,
      ingestedAt: legacy.ingestedAt ?? legacy.publishedAt,
      id: legacy.id,
    };
  } catch {
    return null;
  }
}
