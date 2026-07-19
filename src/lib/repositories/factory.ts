import { getConfig } from "@/config/accessors";
import type { ArticleRepository } from "@/lib/repositories/contracts/article-repository";
import type { SourceRepository } from "@/lib/repositories/contracts/source-repository";
import { SupabaseArticleRepository } from "@/lib/repositories/supabase/supabase-article-repository";
import { SupabaseSourceRepository } from "@/lib/repositories/supabase/supabase-source-repository";
import {
  createSupabaseAdminClient,
  isSupabasePersistenceConfigured,
} from "@/lib/supabase";

export type ContentRepositories = {
  sourceRepository: SourceRepository;
  articleRepository: ArticleRepository;
  supabaseArticleRepository: SupabaseArticleRepository;
};

export function createContentRepositories(): ContentRepositories | null {
  if (!isSupabasePersistenceConfigured()) {
    return null;
  }

  const client = createSupabaseAdminClient();
  const sourceRepository = new SupabaseSourceRepository(client);
  const supabaseArticleRepository = new SupabaseArticleRepository(client);

  return {
    sourceRepository,
    articleRepository: supabaseArticleRepository,
    supabaseArticleRepository,
  };
}

export function isContentPersistenceEnabled(): boolean {
  return getConfig().supabase.persistenceEnabled;
}
