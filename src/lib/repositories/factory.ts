import { getConfig } from "@/config/accessors";
import type { LanguageResolver } from "@/lib/news-ingestion/persistence/normalized-article-persistence-service";
import type { ArticleRepository } from "@/lib/repositories/contracts/article-repository";
import type { ArticleTranslationRepository } from "@/lib/repositories/contracts/article-translation-repository";
import type { SourceRepository } from "@/lib/repositories/contracts/source-repository";
import { PostgresArticleRepository } from "@/lib/repositories/postgres/postgres-article-repository";
import { PostgresArticleTranslationRepository } from "@/lib/repositories/postgres/postgres-article-translation-repository";
import { PostgresSourceRepository } from "@/lib/repositories/postgres/postgres-source-repository";
import { SupabaseArticleRepository } from "@/lib/repositories/supabase/supabase-article-repository";
import { SupabaseArticleTranslationRepository } from "@/lib/repositories/supabase/supabase-article-translation-repository";
import { SupabaseSourceRepository } from "@/lib/repositories/supabase/supabase-source-repository";
import { isPostgresPersistenceConfigured } from "@/lib/postgres";
import {
  createSupabaseAdminClient,
  isSupabasePersistenceConfigured,
} from "@/lib/supabase";

export type ContentRepositories = {
  sourceRepository: SourceRepository;
  articleRepository: ArticleRepository;
  translationRepository: ArticleTranslationRepository;
  languageResolver: LanguageResolver;
};

export function createContentRepositories(): ContentRepositories | null {
  if (isPostgresPersistenceConfigured()) {
    const articleRepository = new PostgresArticleRepository();
    return {
      sourceRepository: new PostgresSourceRepository(),
      articleRepository,
      translationRepository: new PostgresArticleTranslationRepository(),
      languageResolver: {
        resolveLanguageId: (code) => articleRepository.resolveLanguageId(code),
      },
    };
  }

  if (!isSupabasePersistenceConfigured()) {
    return null;
  }

  const client = createSupabaseAdminClient();
  const articleRepository = new SupabaseArticleRepository(client);
  return {
    sourceRepository: new SupabaseSourceRepository(client),
    articleRepository,
    translationRepository: new SupabaseArticleTranslationRepository(client),
    languageResolver: {
      resolveLanguageId: (code) => articleRepository.resolveLanguageId(code),
    },
  };
}

export function isContentPersistenceEnabled(): boolean {
  return (
    isPostgresPersistenceConfigured() ||
    getConfig().supabase.persistenceEnabled ||
    getConfig().postgres.persistenceEnabled
  );
}
