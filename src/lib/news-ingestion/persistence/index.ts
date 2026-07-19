export type { ArticlePersister } from "@/lib/news-ingestion/persistence/article-persister";
export { AbstractArticlePersister } from "@/lib/news-ingestion/persistence/article-persister";
export {
  NormalizedArticlePersistenceService,
  createLanguageResolverFromArticleRepository,
  type ArticlePersistenceResult,
  type NormalizedArticlePersistenceOutput,
  type LanguageResolver,
} from "@/lib/news-ingestion/persistence/normalized-article-persistence-service";
