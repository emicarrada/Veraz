import { StageNotImplementedError } from "@/lib/news-ingestion/errors";
import type { PipelineStage, PipelineContext } from "@/lib/news-ingestion/pipeline/pipeline-stage";
import type { ProviderPayload, NormalizedArticle } from "@/lib/news-ingestion/types/article";
import type { IngestionResult } from "@/lib/news-ingestion/types/results";

export type NormalizeStageInput = {
  payload: ProviderPayload;
};

export type NormalizeStage = PipelineStage<NormalizeStageInput, NormalizedArticle>;

export abstract class AbstractNormalizeStage implements NormalizeStage {
  readonly stageId = "normalize" as const;

  async execute(
    _input: NormalizeStageInput,
    _context: PipelineContext,
  ): Promise<IngestionResult<NormalizedArticle>> {
    throw new StageNotImplementedError(this.stageId);
  }
}
