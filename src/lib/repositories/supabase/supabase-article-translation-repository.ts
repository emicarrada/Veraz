import type { ArticleId } from "@/domain/shared/ids";
import type {
  ArticleTranslation,
  ArticleTranslationInput,
  ArticleTranslationRepository,
} from "@/lib/repositories/contracts/article-translation-repository";
import type { Locale } from "@/i18n/routing";
import type { Database } from "@/lib/supabase/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

type TranslationRow = Database["public"]["Tables"]["article_translations"]["Row"];

function mapRow(row: TranslationRow): ArticleTranslation {
  return {
    articleId: row.article_id as ArticleId,
    locale: row.locale as Locale,
    title: row.title,
    excerpt: row.excerpt,
    ...(row.body_excerpt ? { bodyExcerpt: row.body_excerpt } : {}),
    sourceLocale: row.source_locale,
    provider: row.provider as "ai" | "manual",
    createdAt: row.created_at,
  };
}

export class SupabaseArticleTranslationRepository implements ArticleTranslationRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async findByArticleIds(
    articleIds: ReadonlyArray<ArticleId>,
    locale: Locale,
  ): Promise<Map<ArticleId, ArticleTranslation>> {
    if (articleIds.length === 0) return new Map();

    const { data, error } = await this.client
      .from("article_translations")
      .select("*")
      .eq("locale", locale)
      .in("article_id", [...articleIds]);

    if (error) {
      throw new Error(`Failed to load article translations: ${error.message}`);
    }

    return new Map(
      (data ?? []).map((row) => {
        const mapped = mapRow(row);
        return [mapped.articleId, mapped] as const;
      }),
    );
  }

  async save(input: ArticleTranslationInput): Promise<ArticleTranslation> {
    const { data, error } = await this.client
      .from("article_translations")
      .upsert(
        {
          article_id: input.articleId,
          locale: input.locale,
          title: input.title,
          excerpt: input.excerpt,
          body_excerpt: input.bodyExcerpt ?? null,
          source_locale: input.sourceLocale,
          provider: input.provider,
        },
        { onConflict: "article_id,locale" },
      )
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to save article translation: ${error.message}`);
    }

    return mapRow(data);
  }
}
