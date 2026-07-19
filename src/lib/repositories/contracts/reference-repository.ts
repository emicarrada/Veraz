import type { Reference } from "@/domain/content/reference";
import type { ArticleId } from "@/domain/shared/ids";

/** Contract only — persistence handled by ArticleRepository in this phase. */
export type ReferenceRepository = {
  findByArticleId(articleId: ArticleId): Promise<ReadonlyArray<Reference>>;
  deleteByArticleId(articleId: ArticleId): Promise<void>;
  insertMany(references: ReadonlyArray<Omit<Reference, "id">>): Promise<ReadonlyArray<Reference>>;
};
