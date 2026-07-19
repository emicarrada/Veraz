/**
 * Shared request / result contracts for the AI Engine.
 * No provider-specific payloads belong here.
 */

export type AIArticleInput = {
  /** Stable article identifier from the news domain. */
  articleId: string;
  title: string;
  excerpt?: string;
  /** Source attribution text or name — never invent facts beyond this material. */
  sourceName?: string;
  sourceUrl?: string;
  /** Optional plain-text body excerpt already licensed/allowed to process. */
  contentExcerpt?: string;
  locale?: string;
};

export type AISummaryResult = {
  summary: string;
  /** Source references the model was instructed to ground on. */
  sourceRefs: string[];
};

export type AIContextResult = {
  context: string;
  sourceRefs: string[];
};

export type AIBiasResult = {
  /** Neutral, explanatory label — not a moral verdict. */
  assessment: string;
  explanation: string;
  sourceRefs: string[];
};

export type AIReliabilityResult = {
  scoreLabel: string;
  explanation: string;
  sourceRefs: string[];
};

export type AITimelineResult = {
  events: Array<{
    label: string;
    detail: string;
  }>;
  sourceRefs: string[];
};

export type AIRelatedResult = {
  /** Related article ids suggested for clustering/UI — empty if unknown. */
  relatedArticleIds: string[];
  rationale?: string;
};

/**
 * Discriminated enrichment payload produced by a successful Engine call.
 */
export type AIEnrichment =
  | { kind: "summary"; data: AISummaryResult }
  | { kind: "context"; data: AIContextResult }
  | { kind: "bias"; data: AIBiasResult }
  | { kind: "reliability"; data: AIReliabilityResult }
  | { kind: "timeline"; data: AITimelineResult }
  | { kind: "related"; data: AIRelatedResult };
