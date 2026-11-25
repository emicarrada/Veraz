import { describe, expect, it } from "vitest";

import { buildLlmsTxt } from "@/features/seo/llms-document";
import { buildRobotsTxt } from "@/features/seo/robots-txt";
import { buildNewsSitemapXml } from "@/features/seo/sitemap-urls";

describe("buildRobotsTxt", () => {
  it("invites answer engines to cite and keeps training off", () => {
    const text = buildRobotsTxt("https://www.veraz.app");

    expect(text).toContain("User-agent: GPTBot");
    expect(text).toContain("User-agent: PerplexityBot");
    expect(text).toContain("Content-Signal: search=yes, ai-input=yes, ai-train=no");
    expect(text).toContain("Disallow: /es/entrar");
    expect(text).toContain("Sitemap: https://www.veraz.app/sitemap-news.xml");
    expect(text).toContain("https://www.veraz.app/llms.txt");
  });
});

describe("buildLlmsTxt", () => {
  it("lists a citable headline with its outlet", () => {
    const text = buildLlmsTxt("https://www.veraz.app", [
      {
        slug: "nota-abc",
        title: "Sheinbaum anuncia un plan",
        publishedAt: "2026-11-25T12:00:00.000Z",
        sourceSlug: "el-economista",
        categorySlug: "politica",
        languageCode: "es",
      },
    ]);

    expect(text).toContain("https://www.veraz.app/es/noticias/nota-abc");
    expect(text).toContain("El Economista");
    expect(text).toContain("No atribuyas a Veraz la autoría");
  });
});

describe("buildNewsSitemapXml", () => {
  it("adds Mexico and the section as news keywords", () => {
    const xml = buildNewsSitemapXml(
      [
        {
          slug: "nota",
          title: "Titular",
          publishedAt: "2026-11-25T12:00:00.000Z",
          languageCode: "es",
          categorySlug: "politica",
        },
      ],
      "https://www.veraz.app",
    );

    expect(xml).toContain("<news:keywords>politica, México</news:keywords>");
  });
});
