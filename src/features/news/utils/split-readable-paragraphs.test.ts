import { describe, expect, it } from "vitest";

import {
  splitIntoReadableParagraphs,
  splitSentences,
} from "@/features/news/utils/split-readable-paragraphs";

const SAMPLE_WALL =
  "Con esa decisión de Gardner y el TMO terminó el encuentro entre los Pumas e Inglaterra. Los visitantes se impusieron por 31-24 en Santiago del Estero. La última jugada tiene más de 20 fases. Termina con Delguy ingresando al in-goal y apoyando. Pero la jugada es revisada por el TMO. El hombro del argentino toca la bandera.";

describe("splitSentences", () => {
  it("splits Spanish sentences on period boundaries", () => {
    const sentences = splitSentences(SAMPLE_WALL);
    expect(sentences.length).toBeGreaterThanOrEqual(5);
    expect(sentences[0]).toContain("Gardner");
    expect(sentences[1]).toContain("31-24");
  });
});

describe("splitIntoReadableParagraphs", () => {
  it("creates multiple short paragraphs from a wall of text", () => {
    const paragraphs = splitIntoReadableParagraphs(SAMPLE_WALL);
    expect(paragraphs.length).toBeGreaterThan(2);
    expect(paragraphs.every((p) => p.length <= 280)).toBe(true);
  });

  it("preserves existing paragraph breaks", () => {
    const paragraphs = splitIntoReadableParagraphs("Primer bloque.\n\nSegundo bloque.");
    expect(paragraphs).toEqual(["Primer bloque.", "Segundo bloque."]);
  });

  it("decodes entities before splitting", () => {
    const paragraphs = splitIntoReadableParagraphs(
      "La Fiscal&#237;a actu&#243;. El caso contin&#250;a.",
    );
    expect(paragraphs.some((p) => p.includes("Fiscalía"))).toBe(true);
  });
});
