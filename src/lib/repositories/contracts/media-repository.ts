import type { Media } from "@/domain/content/media";
import type { ArticleId, MediaId } from "@/domain/shared/ids";

/** Contract only — persistence handled by ArticleRepository in this phase. */
export type MediaRepository = {
  findByArticleId(articleId: ArticleId): Promise<ReadonlyArray<Media>>;
  deleteByArticleId(articleId: ArticleId): Promise<void>;
  insert(media: Omit<Media, "id">): Promise<Media>;
  insertMany(media: ReadonlyArray<Omit<Media, "id">>): Promise<ReadonlyArray<Media>>;
};

export type { MediaId };
