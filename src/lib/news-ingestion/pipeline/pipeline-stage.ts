import type { PipelineStageId } from "@/lib/news-ingestion/errors/codes";
import type { IngestionResult } from "@/lib/news-ingestion/types/results";
import type { PipelineState } from "@/lib/news-ingestion/types/pipeline-state";

/** Shared context passed through pipeline stages (future orchestrator). */
export type PipelineContext = {
  runId: string;
  state: PipelineState;
  retryPolicy?: import("@/lib/news-ingestion/types/pipeline-state").RetryPolicy;
  /** Catalog default when RSS feed omits `<language>`. */
  defaultLanguageCode?: string;
};

export type PipelineStage<TInput, TOutput> = {
  readonly stageId: PipelineStageId;
  execute(input: TInput, context: PipelineContext): Promise<IngestionResult<TOutput>>;
};
