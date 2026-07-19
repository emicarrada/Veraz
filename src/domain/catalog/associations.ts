import type {
  ArticleId,
  CategoryId,
  TagId,
  TopicId,
} from "@/domain/shared/ids";

/** Many-to-many associations (join concepts). */

export type ArticleCategory = {
  articleId: ArticleId;
  categoryId: CategoryId;
};

export type ArticleTopic = {
  articleId: ArticleId;
  topicId: TopicId;
};

export type ArticleTag = {
  articleId: ArticleId;
  tagId: TagId;
};
