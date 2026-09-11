import type { ArticleId } from "@/domain/shared/ids";
import type { Locale } from "@/i18n/routing";
import { createPostgresPool } from "@/lib/postgres";
import type {
  ArticleTranslation,
  ArticleTranslationInput,
  ArticleTranslationRepository,
} from "@/lib/repositories/contracts/article-translation-repository";
import type { Database } from "@/lib/supabase/database.types";

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

export class PostgresArticleTranslationRepository implements ArticleTranslationRepository {
  async findByArticleIds(
    articleIds: ReadonlyArray<ArticleId>,
    locale: Locale,
  ): Promise<Map<ArticleId, ArticleTranslation>> {
    if (articleIds.length === 0) return new Map();

    const { rows } = await createPostgresPool().query<TranslationRow>(
      `
      SELECT * FROM article_translations
      WHERE locale = $1 AND article_id = ANY($2::uuid[])
      `,
      [locale, [...articleIds]],
    );

    return new Map(
      rows.map((row) => {
        const mapped = mapRow(row);
        return [mapped.articleId, mapped] as const;
      }),
    );
  }

  async save(input: ArticleTranslationInput): Promise<ArticleTranslation> {
    const { rows } = await createPostgresPool().query<TranslationRow>(
      `
      INSERT INTO article_translations (
        article_id, locale, title, excerpt, body_excerpt, source_locale, provider
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (article_id, locale) DO UPDATE SET
        title = EXCLUDED.title,
        excerpt = EXCLUDED.excerpt,
        body_excerpt = EXCLUDED.body_excerpt,
        source_locale = EXCLUDED.source_locale,
        provider = EXCLUDED.provider
      RETURNING *
      `,
      [
        input.articleId,
        input.locale,
        input.title,
        input.excerpt,
        input.bodyExcerpt ?? null,
        input.sourceLocale,
        input.provider,
      ],
    );

    const row = rows[0];
    if (!row) {
      throw new Error("Failed to save article translation: no row returned.");
    }
    return mapRow(row);
  }
}
