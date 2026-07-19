import type {
  ArticleId,
  BookmarkCollectionId,
  BookmarkId,
  UserId,
} from "@/domain/shared/ids";
import type { Instant } from "@/domain/shared/value-objects";

export type Bookmark = {
  id: BookmarkId;
  userId: UserId;
  articleId: ArticleId;
  createdAt: Instant;
  note?: string;
  collectionId?: BookmarkCollectionId;
};
