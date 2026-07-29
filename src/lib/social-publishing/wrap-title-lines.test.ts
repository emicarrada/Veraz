import { describe, expect, it } from "vitest";

import { fitTitleLayout, wrapTitleLines } from "@/lib/social-publishing/wrap-title-lines";

describe("wrapTitleLines", () => {
  it("wraps all words without ellipsis", () => {
    const title =
      "El gobierno anunció medidas económicas tras la reunión con el FMI y los gobernadores provinciales";
    const lines = wrapTitleLines(title, 26);
    expect(lines.join(" ")).toBe(title);
    expect(lines.some((line) => line.endsWith("…"))).toBe(false);
  });

  it("keeps long single words intact", () => {
    const lines = wrapTitleLines("Supercalifragilistico", 10);
    expect(lines).toEqual(["Supercalifragilistico"]);
  });
});

describe("fitTitleLayout", () => {
  it("returns more lines for long titles on square cards", () => {
    const title = "Uno dos tres cuatro cinco seis siete ocho nueve diez once doce trece catorce quince";
    const { lines } = fitTitleLayout({
      title,
      isVertical: false,
      height: 1080,
      marginBottom: 56,
      footerCaptionHeight: 36,
      sourceRowHeight: 56,
      contentGap: 28,
    });
    expect(lines.join(" ")).toBe(title);
    expect(lines.length).toBeGreaterThan(3);
  });
});
