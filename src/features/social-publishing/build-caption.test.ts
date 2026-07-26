import { describe, expect, it } from "vitest";

import type { ArticleId } from "@/domain/shared/ids";
import { buildSocialCaption, buildSocialCaptions } from "@/features/social-publishing/build-caption";
import type { SocialArticleCandidate } from "@/features/social-publishing/types";

const base: SocialArticleCandidate = {
  articleId: "a1" as ArticleId,
  slug: "demo-slug",
  title: "Titular de prueba",
  excerpt: "Lead",
  categorySlug: "general",
  languageCode: "es",
  sourceSlug: "infobae",
  sourceName: "Infobae",
  sourceAttribution: "Infobae",
  categoryFallbackImageUrl: "https://www.veraz.app/ImagenesNoticias/general.webp",
  locale: "es",
  verazArticleUrl: "https://www.veraz.app/es/noticias/demo-slug",
};

describe("buildSocialCaption", () => {
  it("includes title, link and source", () => {
    const caption = buildSocialCaption(base);
    expect(caption).toContain("Titular de prueba");
    expect(caption).toContain("https://www.veraz.app/es/noticias/demo-slug");
    expect(caption).toContain("Fuente: Infobae");
  });

  it("builds platform-specific captions", () => {
    const captions = buildSocialCaptions(base, {
      locale: "es",
      platforms: ["x", "instagram"],
      globalHashtags: [],
      includeExcerpt: false,
    });
    expect(captions.x.length).toBeLessThanOrEqual(280);
    expect(captions.x).toContain("https://www.veraz.app/es/noticias/demo-slug");
    expect(captions.instagram).toContain("#Veraz");
  });
});
