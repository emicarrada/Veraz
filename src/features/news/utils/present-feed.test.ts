import { describe, expect, it } from "vitest";

import type { ArticleId } from "@/domain/shared/ids";
import type { ArticleFeedItem } from "@/features/news/types/feed";
import { buildFeedRows } from "@/features/news/utils/present-feed";

function item(
  overrides: Omit<Partial<ArticleFeedItem>, "id"> & {
    id: string;
    title: string;
    publishedAt: string;
    sourceSlug: string;
  },
): ArticleFeedItem {
  return {
    slug: overrides.id,
    excerpt: "",
    summary: overrides.title,
    categorySlug: "internacional",
    categoryLabel: "Internacional",
    categoryFallbackImageUrl: "/ImagenesNoticias/general.webp",
    canonicalUrl: "https://example.com",
    sourceName: overrides.sourceSlug,
    sourceAttributionName: overrides.sourceSlug,
    languageCode: "es",
    isTranslated: false,
    showOriginalLanguageNote: false,
    ...overrides,
    id: overrides.id as ArticleId,
  };
}

describe("buildFeedRows", () => {
  it("groups similar headlines from different outlets and leads with that group", () => {
    const rows = buildFeedRows([
      item({
        id: "a",
        sourceSlug: "reforma",
        publishedAt: "2026-07-18T12:00:00.000Z",
        title: "Sheinbaum presenta reforma judicial en el Congreso",
      }),
      item({
        id: "b",
        sourceSlug: "el-pais",
        publishedAt: "2026-07-18T11:00:00.000Z",
        title: "Sheinbaum impulsa reforma judicial en el Congreso",
      }),
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      kind: "cluster",
      variant: "lead",
    });
    if (rows[0]?.kind === "cluster") {
      expect(rows[0].items.map((entry) => entry.id)).toEqual(["a", "b"]);
    }
  });

  it("keeps two pieces from the same outlet separate", () => {
    const rows = buildFeedRows([
      item({
        id: "a",
        sourceSlug: "reforma",
        publishedAt: "2026-07-18T12:00:00.000Z",
        title: "Sheinbaum presenta reforma judicial en el Congreso",
      }),
      item({
        id: "b",
        sourceSlug: "reforma",
        publishedAt: "2026-07-18T11:00:00.000Z",
        title: "Sheinbaum impulsa reforma judicial en el Congreso",
      }),
    ]);

    expect(rows.map((row) => row.kind)).toEqual(["article", "article"]);
  });

  it("does not merge unrelated headlines", () => {
    const rows = buildFeedRows([
      item({
        id: "a",
        sourceSlug: "reforma",
        publishedAt: "2026-07-18T12:00:00.000Z",
        title: "Trump visita Mexico para una cumbre comercial",
      }),
      item({
        id: "b",
        sourceSlug: "el-pais",
        publishedAt: "2026-07-18T11:00:00.000Z",
        title: "Trump cancela un decreto sobre aranceles",
      }),
    ]);

    expect(rows.every((row) => row.kind === "article")).toBe(true);
  });

  it("does not merge similar headlines published far apart", () => {
    const rows = buildFeedRows([
      item({
        id: "a",
        sourceSlug: "reforma",
        publishedAt: "2026-07-18T12:00:00.000Z",
        title: "Sheinbaum presenta reforma judicial en el Congreso",
      }),
      item({
        id: "b",
        sourceSlug: "el-pais",
        publishedAt: "2026-07-16T12:00:00.000Z",
        title: "Sheinbaum impulsa reforma judicial en el Congreso",
      }),
    ]);

    expect(rows.map((row) => row.kind)).toEqual(["article", "article"]);
  });

  it("alternates media and compact cards after the lead", () => {
    const rows = buildFeedRows([
      item({
        id: "a",
        sourceSlug: "a",
        publishedAt: "2026-07-18T12:00:00.000Z",
        title: "OpenAI lanza modelo de voz para empresas",
      }),
      item({
        id: "b",
        sourceSlug: "b",
        publishedAt: "2026-07-18T11:00:00.000Z",
        title: "El Real Madrid gana la liga de campeones",
      }),
      item({
        id: "c",
        sourceSlug: "c",
        publishedAt: "2026-07-18T10:00:00.000Z",
        title: "Banxico mantiene la tasa de interes sin cambios",
      }),
    ]);

    expect(rows.map((row) => (row.kind === "article" ? row.variant : row.kind))).toEqual([
      "lead",
      "media",
      "compact",
    ]);
  });

  it("inserts a place marker before the first item of the next page", () => {
    const rows = buildFeedRows(
      [
        item({
          id: "a",
          sourceSlug: "a",
          publishedAt: "2026-07-18T12:00:00.000Z",
          title: "OpenAI lanza modelo de voz para empresas",
        }),
        item({
          id: "b",
          sourceSlug: "b",
          publishedAt: "2026-07-18T10:00:00.000Z",
          title: "Banxico mantiene la tasa de interes sin cambios",
        }),
      ],
      [{ itemId: "b", publishedAt: "2026-07-18T10:00:00.000Z" }],
    );

    expect(rows.map((row) => row.kind)).toEqual(["article", "marker", "article"]);
    expect(rows[1]).toMatchObject({ kind: "marker", itemId: "b" });
  });

  it("keeps a country-first order instead of resorting by time", () => {
    const rows = buildFeedRows(
      [
        item({
          id: "home",
          sourceSlug: "la-jornada",
          publishedAt: "2026-07-18T08:00:00.000Z",
          title: "Exposición de Tamayo abre en el Museo de Arte Moderno",
        }),
        item({
          id: "foreign",
          sourceSlug: "el-pais",
          publishedAt: "2026-07-18T18:00:00.000Z",
          title: "El Congreso español debate la reforma laboral",
        }),
      ],
      [],
      { keepOrder: true },
    );

    expect(rows[0]).toMatchObject({ kind: "article", item: { id: "home" } });
    expect(rows[1]).toMatchObject({ kind: "article", item: { id: "foreign" } });
  });
});
