import type { StoryStageOutput } from "@/lib/news-ingestion/types/dedupe-story";

/**
 * Article ready for persistence — all upstream stages completed.
 */
export type ReadyArticle = {
  pipelineRunId: string;
  item: StoryStageOutput;
  readyAt: string;
};

export type PersistenceOutput = {
  ready: ReadyArticle;
  /** Domain article id assigned on persist (future). */
  articleId?: string;
  persistedAt: string;
};

export type PublishOutput = {
  articleId: string;
  publishedAt: string;
  /** Cache tags / paths to revalidate (future). */
  revalidationTargets?: ReadonlyArray<string>;
};

export type EnrichmentOutput = {
  pipelineRunId: string;
  /** Whether enrichment was scheduled — never blocks publish. */
  scheduled: boolean;
  skippedReason?: "disabled" | "fail_open" | "not_configured";
};
