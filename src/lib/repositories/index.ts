export type {
  ArticleRepository,
  ArticlePersistInput,
  ArticlePersistResult,
  ArticleFeedRecord,
  ListFeedArticlesParams,
  ListFeedArticlesResult,
  ArticleDetailRecord,
  SourceRepository,
  EnsureRssSourceInput,
  LanguageRepository,
  MediaRepository,
  ReferenceRepository,
  FeedCursor,
} from "@/lib/repositories/contracts";

export {
  encodeFeedCursor,
  decodeFeedCursor,
} from "@/lib/repositories/contracts";

export {
  createContentRepositories,
  isContentPersistenceEnabled,
  type ContentRepositories,
} from "@/lib/repositories/factory";

export { SupabaseArticleRepository } from "@/lib/repositories/supabase/supabase-article-repository";
export { SupabaseSourceRepository } from "@/lib/repositories/supabase/supabase-source-repository";
