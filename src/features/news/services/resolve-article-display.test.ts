import { describe, expect, it, vi } from "vitest";

import type { ArticleId } from "@/domain/shared/ids";
import { resolveArticlesDisplay } from "@/features/news/services/resolve-article-display";

vi.mock("@/lib/ai-engine/translate", async () => {
  const actual = await vi.importActual<typeof import("@/lib/ai-engine/translate")>(
    "@/lib/ai-engine/translate",
  );
  return {
    ...actual,
    translateArticleContent: vi.fn(async () => ({
      title: "Titular traducido",
      excerpt: "Extracto traducido",
    })),
  };
});

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

  it("shows the Spanish headline on the technology feed and keeps it if the cache write fails", async () => {
    const repository = {
      findByArticleIds: vi.fn(async () => new Map()),
      save: vi.fn(async () => {
        throw new Error("cache down");
      }),
    };

    const result = await resolveArticlesDisplay("es", [article], repository, { translate: true });

    expect(result.get(article.id)?.title).toBe("Titular traducido");
    expect(result.get(article.id)?.isTranslated).toBe(true);
  });
});
