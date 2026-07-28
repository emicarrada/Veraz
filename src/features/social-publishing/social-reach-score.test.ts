import { describe, expect, it } from "vitest";

import { socialReachScore } from "@/features/social-publishing/social-reach-score";
import type { SocialArticleCandidate } from "@/features/social-publishing/types";

function candidate(
  partial: Partial<SocialArticleCandidate> & Pick<SocialArticleCandidate, "title">,
): SocialArticleCandidate {
  const { title, ...rest } = partial;
  return {
    articleId: "a1" as SocialArticleCandidate["articleId"],
    slug: "test-slug",
    title,
    excerpt: "",
    categorySlug: "general",
    languageCode: "es",
    sourceSlug: "infobae",
    sourceName: "Infobae",
    sourceAttribution: "Infobae",
    categoryFallbackImageUrl: "https://www.veraz.app/x.webp",
    locale: "es",
    verazArticleUrl: "https://www.veraz.app/es/noticias/test-slug",
    ...rest,
  };
}

describe("socialReachScore", () => {
  it("scores sports and hero higher than hyper-local general", () => {
    const strong = candidate({
      title: "Messi anotó dos goles en el clásico: última hora",
      categorySlug: "messi",
      heroImageUrl: "https://cdn.example/photo.jpg",
      excerpt: "x".repeat(90),
    });
    const weak = candidate({
      title: "El intendente de Santa Cruz presentó obras en un barrio",
      categorySlug: "general",
      sourceSlug: "infobae",
    });
    expect(socialReachScore(strong)).toBeGreaterThanOrEqual(3);
    expect(socialReachScore(weak)).toBeLessThan(3);
  });
});
