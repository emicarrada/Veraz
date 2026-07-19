import { describe, expect, it } from "vitest";

import { classifyArticle } from "@/features/news/classification/article-category-classifier";
import {
  getCategoryFallbackImageUrl,
  getCategoryLabel,
  getTopicSlugsForFilter,
} from "@/features/news/classification/categories";

describe("classifyArticle", () => {
  it("tags nba stories as baloncesto, not internacional", () => {
    const slug = classifyArticle({
      title: "Lakers vencen a Celtics en la NBA",
      excerpt: "Partido de baloncesto en Estados Unidos.",
    });

    expect(slug).toBe("nba");
    expect(getCategoryLabel(slug)).toBe("Baloncesto");
    expect(getCategoryFallbackImageUrl(slug)).toContain("nba.webp");
  });

  it("tags sheinbaum stories with the sheinbaum label and image", () => {
    const slug = classifyArticle({
      title: "Sheinbaum anuncia reforma energética",
      excerpt: "La presidenta presentó el plan en Palacio Nacional.",
    });

    expect(slug).toBe("sheinbaum");
    expect(getCategoryFallbackImageUrl(slug)).toContain("sheinbaum.webp");
  });

  it("tags trump stories specifically", () => {
    const slug = classifyArticle({
      title: "Trump impone nuevos aranceles",
      excerpt: "Medida afecta comercio internacional.",
    });

    expect(slug).toBe("trump");
    expect(getCategoryFallbackImageUrl(slug)).toContain("trump.webp");
  });

  it("uses internacional.webp for general world news", () => {
    const slug = classifyArticle({
      title: "La ONU pide tregua en Medio Oriente",
      excerpt: "Diplomáticos europeos respaldan la propuesta.",
    });

    expect(slug).toBe("internacional");
    expect(getCategoryFallbackImageUrl(slug)).toContain("internacional.webp");
  });

  it("detects rugby before generic deportes", () => {
    expect(
      classifyArticle({
        title: "Los Pumas arrancan el Six Nations",
        excerpt: "El rugby argentino busca sorpresa.",
      }),
    ).toBe("rugby");
  });

  it("detects messi and ronaldo as player topics", () => {
    expect(
      classifyArticle({
        title: "Messi brilla en la MLS",
        excerpt: "Inter Miami golea en casa.",
      }),
    ).toBe("messi");

    expect(
      classifyArticle({
        title: "Ronaldo marca hat-trick en Arabia",
        excerpt: "CR7 sigue imparable.",
      }),
    ).toBe("ronaldo");
  });

  it("detects mercados and criptomonedas finance tags", () => {
    expect(
      classifyArticle({
        title: "Wall Street cierra al alza tras datos del S&P 500",
        excerpt: "El Nasdaq también sube en la sesión.",
      }),
    ).toBe("mercados");

    expect(
      classifyArticle({
        title: "Bitcoin supera máximo histórico",
        excerpt: "Las criptomonedas repuntan en la semana.",
      }),
    ).toBe("criptomonedas");
  });
});

describe("getTopicSlugsForFilter", () => {
  it("expands deportes filter to all sport topics", () => {
    const slugs = getTopicSlugsForFilter("deportes");
    expect(slugs).toContain("nba");
    expect(slugs).toContain("futbol");
    expect(slugs).toContain("rugby");
    expect(slugs).toContain("messi");
  });

  it("expands economia filter to finance-specific topics", () => {
    const slugs = getTopicSlugsForFilter("economia");
    expect(slugs).toContain("mercados");
    expect(slugs).toContain("criptomonedas");
  });

  it("keeps specific filters as a single slug", () => {
    expect(getTopicSlugsForFilter("nba")).toEqual(["nba"]);
    expect(getTopicSlugsForFilter("sheinbaum")).toEqual(["sheinbaum"]);
  });
});
