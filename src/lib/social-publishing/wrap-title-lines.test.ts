import path from "node:path";

import { describe, expect, it } from "vitest";

import { SOCIAL_CARD_VARIANTS } from "@/features/social-publishing/templates/card-variants";
import { buildHeroGradientOverlay } from "@/lib/social-publishing/hero-gradient-overlay";
import { fitTitleLayout, wrapTitleLines } from "@/lib/social-publishing/wrap-title-lines";

const LONG_TITLE =
  "El gobierno anunció medidas económicas tras la reunión con el FMI y los gobernadores provinciales";

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

describe("buildHeroGradientOverlay", () => {
  it("embeds the full headline without ellipsis on feed cards", () => {
    const root = process.cwd();
    const svg = buildHeroGradientOverlay(
      LONG_TITLE,
      "Infobae",
      SOCIAL_CARD_VARIANTS["hero-gradient"],
      path.join(root, "public/fonts/font/HelveticaNowDisplay-Bold.woff2"),
      path.join(root, "public/fonts/font/HelveticaNowDisplay-Medium.woff2"),
    ).toString("utf8");

    expect(svg).not.toContain("…");
    expect(svg).toContain("gobernadores provinciales");
  });
});
