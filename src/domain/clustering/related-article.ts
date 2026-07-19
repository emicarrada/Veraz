import type { ArticleId, RelatedArticleId } from "@/domain/shared/ids";
import type {
  RelationOrigin,
  RelationStatus,
  RelationType,
} from "@/domain/shared/enums";

export type RelatedArticle = {
  id: RelatedArticleId;
  fromArticleId: ArticleId;
  toArticleId: ArticleId;
  relationType: RelationType;
  strength?: number;
  origin: RelationOrigin;
  status: RelationStatus;
};
