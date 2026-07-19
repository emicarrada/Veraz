import { decodeHtmlEntities } from "@/lib/news-ingestion/utils/html-utils";

export type ReadableParagraphOptions = {
  /** Sentences grouped per paragraph when text has no natural breaks. */
  maxSentencesPerParagraph?: number;
  /** Soft limit per paragraph to avoid long blocks. */
  maxCharsPerParagraph?: number;
  /** Cap paragraphs shown in article detail. */
  maxParagraphs?: number;
};

const DEFAULT_OPTIONS: Required<ReadableParagraphOptions> = {
  maxSentencesPerParagraph: 2,
  maxCharsPerParagraph: 260,
  maxParagraphs: 8,
};

/** Splits on sentence boundaries (Spanish-friendly). */
export function splitSentences(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const parts = trimmed.split(/(?<=[.!?…])\s+(?=[A-ZÁÉÍÓÚÑ¿"«(])/);
  const sentences = parts.map((part) => part.trim()).filter(Boolean);

  return sentences.length > 0 ? sentences : [trimmed];
}

function groupSentencesIntoParagraphs(
  sentences: string[],
  maxSentences: number,
  maxChars: number,
): string[] {
  const paragraphs: string[] = [];
  let bucket: string[] = [];
  let bucketLength = 0;

  const flush = () => {
    if (bucket.length === 0) return;
    paragraphs.push(bucket.join(" "));
    bucket = [];
    bucketLength = 0;
  };

  for (const sentence of sentences) {
    const nextLength = bucketLength + sentence.length + (bucket.length > 0 ? 1 : 0);
    const sentenceLimitReached = bucket.length >= maxSentences;
    const charLimitReached = bucket.length > 0 && nextLength > maxChars;

    if (sentenceLimitReached || charLimitReached) {
      flush();
    }

    bucket.push(sentence);
    bucketLength += sentence.length + (bucket.length > 1 ? 1 : 0);
  }

  flush();
  return paragraphs;
}

function normalizeArticleBody(text: string): string {
  return decodeHtmlEntities(text)
    .replace(/\r\n/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Turns wall-of-text content into short, readable paragraphs.
 * Preserves existing `\n\n` breaks; otherwise groups sentences.
 */
export function splitIntoReadableParagraphs(
  text: string,
  options: ReadableParagraphOptions = {},
): string[] {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const normalized = normalizeArticleBody(text);
  if (!normalized) return [];

  const rawBlocks = normalized
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  const blocks = rawBlocks.length > 0 ? rawBlocks : [normalized];

  const paragraphs = blocks.flatMap((block) => {
    if (block.length <= config.maxCharsPerParagraph) {
      return [block];
    }
    return groupSentencesIntoParagraphs(
      splitSentences(block),
      config.maxSentencesPerParagraph,
      config.maxCharsPerParagraph,
    );
  });

  return paragraphs.slice(0, config.maxParagraphs);
}
