import type { ArticleId } from "@/domain/shared/ids";
import { mapWithLimit, translateArticleContent } from "@/lib/ai-engine/translate";
import type { ArticleTranslationRepository, ArticleTranslation } from "@/lib/repositories/contracts/article-translation-repository";
import { createContentRepositories } from "@/lib/repositories/factory";
import type { Locale } from "@/i18n/routing";

export type ArticleSourceContent = {
  id: ArticleId;
  title: string;
  excerpt: string;
  bodyExcerpt?: string;
  languageCode: string;
};

export type ResolvedArticleDisplay = {
  title: string;
  excerpt: string;
  bodyExcerpt?: string;
  isTranslated: boolean;
  showOriginalLanguageNote: boolean;
  sourceLanguageCode: string;
};

function normalizeLanguageCode(code: string): string {
  return code.trim().toLowerCase().split("-")[0] ?? code;
}

function createTranslationRepository(): ArticleTranslationRepository | null {
  return createContentRepositories()?.translationRepository ?? null;
}

async function loadCachedTranslations(
  repository: ArticleTranslationRepository | null,
  articleIds: ReadonlyArray<ArticleId>,
  locale: Locale,
): Promise<Map<ArticleId, ArticleTranslation>> {
  if (!repository || articleIds.length === 0) {
    return new Map();
  }

  try {
    return await repository.findByArticleIds(articleIds, locale);
  } catch {
    return new Map();
  }
}

export async function resolveArticleDisplay(
  locale: Locale,
  article: ArticleSourceContent,
  repository: ArticleTranslationRepository | null = createTranslationRepository(),
): Promise<ResolvedArticleDisplay> {
  const sourceLanguageCode = normalizeLanguageCode(article.languageCode);

  if (sourceLanguageCode === locale) {
    return {
      title: article.title,
      excerpt: article.excerpt,
      ...(article.bodyExcerpt ? { bodyExcerpt: article.bodyExcerpt } : {}),
      isTranslated: false,
      showOriginalLanguageNote: false,
      sourceLanguageCode,
    };
  }

  const cachedById = await loadCachedTranslations(repository, [article.id], locale);
  const cached = cachedById.get(article.id);

  if (cached) {
    return {
      title: cached.title,
      excerpt: cached.excerpt,
      ...(cached.bodyExcerpt ? { bodyExcerpt: cached.bodyExcerpt } : {}),
      isTranslated: true,
      showOriginalLanguageNote: false,
      sourceLanguageCode,
    };
  }

  return translateMissing(locale, article, sourceLanguageCode, repository);
}

async function translateMissing(
  locale: Locale,
  article: ArticleSourceContent,
  sourceLanguageCode: string,
  repository: ArticleTranslationRepository | null,
): Promise<ResolvedArticleDisplay> {
  const translated = await translateArticleContent({
    locale,
    sourceLocale: sourceLanguageCode,
    title: article.title,
    excerpt: article.excerpt,
    bodyExcerpt: article.bodyExcerpt,
  });

  if (!translated) {
    return {
      title: article.title,
      excerpt: article.excerpt,
      ...(article.bodyExcerpt ? { bodyExcerpt: article.bodyExcerpt } : {}),
      isTranslated: false,
      showOriginalLanguageNote: true,
      sourceLanguageCode,
    };
  }

  if (repository) {
    try {
      await repository.save({
        articleId: article.id,
        locale,
        title: translated.title,
        excerpt: translated.excerpt,
        ...(translated.bodyExcerpt ? { bodyExcerpt: translated.bodyExcerpt } : {}),
        sourceLocale: sourceLanguageCode,
        provider: "ai",
      });
    } catch {
      // fail-open: show the translation without persisting the cache
    }
  }

  return {
    title: translated.title,
    excerpt: translated.excerpt,
    ...(translated.bodyExcerpt ? { bodyExcerpt: translated.bodyExcerpt } : {}),
    isTranslated: true,
    showOriginalLanguageNote: false,
    sourceLanguageCode,
  };
}

export async function resolveArticlesDisplay(
  locale: Locale,
  articles: ReadonlyArray<ArticleSourceContent>,
  repository: ArticleTranslationRepository | null = createTranslationRepository(),
  options?: { translate?: boolean },
): Promise<Map<ArticleId, ResolvedArticleDisplay>> {
  const result = new Map<ArticleId, ResolvedArticleDisplay>();
  if (articles.length === 0) return result;

  const needsLookup = articles.filter(
    (article) => normalizeLanguageCode(article.languageCode) !== locale,
  );

  const cachedById = await loadCachedTranslations(
    repository,
    needsLookup.map((article) => article.id),
    locale,
  );

  for (const article of articles) {
    const sourceLanguageCode = normalizeLanguageCode(article.languageCode);

    if (sourceLanguageCode === locale) {
      result.set(article.id, {
        title: article.title,
        excerpt: article.excerpt,
        ...(article.bodyExcerpt ? { bodyExcerpt: article.bodyExcerpt } : {}),
        isTranslated: false,
        showOriginalLanguageNote: false,
        sourceLanguageCode,
      });
      continue;
    }

    const cached = cachedById.get(article.id);
    if (cached) {
      result.set(article.id, {
        title: cached.title,
        excerpt: cached.excerpt,
        ...(cached.bodyExcerpt ? { bodyExcerpt: cached.bodyExcerpt } : {}),
        isTranslated: true,
        showOriginalLanguageNote: false,
        sourceLanguageCode,
      });
      continue;
    }

    if (!options?.translate) {
      result.set(article.id, {
        title: article.title,
        excerpt: article.excerpt,
        ...(article.bodyExcerpt ? { bodyExcerpt: article.bodyExcerpt } : {}),
        isTranslated: false,
        showOriginalLanguageNote: true,
        sourceLanguageCode,
      });
    }
  }

  if (options?.translate) {
    const pending = articles.filter((article) => !result.has(article.id));
    await mapWithLimit(pending, 3, async (article) => {
      result.set(
        article.id,
        await translateMissing(
          locale,
          article,
          normalizeLanguageCode(article.languageCode),
          repository,
        ),
      );
    });
  }

  return result;
}
