import { describe, expect, it, vi } from "vitest";

import type { ArticleId } from "@/domain/shared/ids";
import { resolveArticlesDisplay } from "@/features/news/services/resolve-article-display";

describe("resolveArticlesDisplay fail-open", () => {
  const article = {
    id: "article-1" as ArticleId,
    title: "Original title",
    excerpt: "Original excerpt",
    languageCode: "en",
  };

  it("continues with originals when translation repository throws", async () => {
    const repository = {
      findByArticleIds: vi.fn(async () => {
        throw new Error("article_translations missing");
      }),
      save: vi.fn(),
    };

    const result = await resolveArticlesDisplay("es", [article], repository);

    expect(result.get(article.id)?.title).toBe("Original title");
    expect(result.get(article.id)?.showOriginalLanguageNote).toBe(true);
  });
});
