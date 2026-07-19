import { describe, expect, it } from "vitest";

import {
  decodeHtmlEntities,
  normalizeImageUrl,
  stripHtml,
  truncateText,
} from "@/lib/news-ingestion/utils/html-utils";

describe("decodeHtmlEntities", () => {
  it("decodes numeric decimal entities", () => {
    expect(decodeHtmlEntities("Fiscal&#237;a inform&#243;")).toBe("Fiscalía informó");
  });

  it("decodes numeric hex entities", () => {
    expect(decodeHtmlEntities("caf&#xE9;")).toBe("café");
  });

  it("decodes named entities", () => {
    expect(decodeHtmlEntities("Ni&ntilde;o &amp; m&aacute;s")).toBe("Niño & más");
  });
});

describe("stripHtml", () => {
  it("strips tags and decodes entities", () => {
    expect(stripHtml("<p>La Fiscal&#237;a</p>")).toBe("La Fiscalía");
  });
});

describe("normalizeImageUrl", () => {
  it("adds https to protocol-relative URLs", () => {
    expect(normalizeImageUrl("//cdn.example.com/a.jpg")).toBe(
      "https://cdn.example.com/a.jpg",
    );
  });

  it("decodes entities in URLs", () => {
    expect(normalizeImageUrl("https://cdn.example.com/a.jpg?x=1&amp;y=2")).toBe(
      "https://cdn.example.com/a.jpg?x=1&y=2",
    );
  });

  it("returns undefined for invalid URLs", () => {
    expect(normalizeImageUrl("not-a-url")).toBeUndefined();
  });
});

describe("truncateText", () => {
  it("truncates at word boundary with ellipsis", () => {
    const result = truncateText("Uno dos tres cuatro cinco seis", 12);
    expect(result.endsWith("…")).toBe(true);
    expect(result.length).toBeLessThanOrEqual(13);
  });
});
