import { describe, expect, it, vi } from "vitest";

import type { ArticleId, SourceId } from "@/domain/shared/ids";
import {
  buildArticleDetailMetadata,
  buildArticleNewsArticleJsonLd,
  getArticleBySlug,
} from "@/features/news/services/get-article-by-slug";
import type { ArticleDetailRecord } from "@/lib/repositories/contracts/article-repository";
import type { ArticleRepository } from "@/lib/repositories/contracts/article-repository";

const detailRecord: ArticleDetailRecord = {
  article: {
    id: "article-1" as ArticleId,
    sourceId: "source-1" as SourceId,
    slug: "demo-post-abc12345",
    canonicalUrl: "https://example.com/post",
    urlFingerprint: "fp-1",
    title: "Demo Post",
    excerpt: "Lead paragraph for SEO.",
    contentFormat: "text",
    languageId: "lang-en" as import("@/domain/shared/ids").LanguageId,
    publishedAt: "2026-07-16T12:00:00.000Z",
    ingestedAt: "2026-07-17T00:00:00.000Z",
    updatedAt: "2026-07-17T00:00:00.000Z",
    status: "ingested",
    paywallOriginal: false,
  },
  categorySlug: "general",
  source: {
    id: "source-1" as SourceId,
    slug: "demo",
    name: "Demo Source",
    attributionName: "Demo Source",
    homepageUrl: "https://example.com",
  },
  references: [],
};

function createRepository(record: ArticleDetailRecord | null): ArticleRepository {
  return {
    findByUrlFingerprint: vi.fn(),
    findBySlug: vi.fn(async () => record),
    save: vi.fn(),
    listForFeed: vi.fn(),
  };
}

describe("getArticleBySlug", () => {
  it("returns article detail item when slug exists", async () => {
    const result = await getArticleBySlug({
      slug: "demo-post-abc12345",
      articleRepository: createRepository(detailRecord),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.title).toBe("Demo Post");
    expect(result.data.slug).toBe("demo-post-abc12345");
  });

  it("returns not_found for missing slug", async () => {
    const result = await getArticleBySlug({
      slug: "missing",
      articleRepository: createRepository(null),
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe("not_found");
  });

  it("returns not_configured without repository", async () => {
    const result = await getArticleBySlug({ slug: "demo", articleRepository: null });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe("not_configured");
  });
});

describe("article detail SEO helpers", () => {
  const item = {
    id: "article-1" as ArticleId,
    slug: "demo-post-abc12345",
    title: "Demo Post",
    excerpt: "Lead paragraph for SEO.",
    publishedAt: "2026-07-16T12:00:00.000Z",
    canonicalUrl: "https://example.com/post",
    categorySlug: "general" as const,
    categoryLabel: "General",
    categoryFallbackImageUrl: "/ImagenesNoticias/general.webp",
    source: {
      name: "Demo Source",
      slug: "demo",
      attributionName: "Demo Source",
      homepageUrl: "https://example.com",
    },
    references: [],
  };

  it("builds metadata with canonical and open graph fields", () => {
    const metadata = buildArticleDetailMetadata(item, "http://localhost:3000");

    expect(metadata.title).toContain("Demo Post");
    expect(metadata.alternates?.canonical).toBe("/noticias/demo-post-abc12345");
    expect(metadata.openGraph?.type).toBe("article");
    expect(metadata.twitter?.card).toBe("summary");
  });

  it("builds NewsArticle JSON-LD", () => {
    const jsonLd = buildArticleNewsArticleJsonLd(item, "http://localhost:3000");

    expect(jsonLd["@type"]).toBe("NewsArticle");
    expect(jsonLd.headline).toBe("Demo Post");
    expect(jsonLd.isBasedOn).toBe("https://example.com/post");
  });
});
