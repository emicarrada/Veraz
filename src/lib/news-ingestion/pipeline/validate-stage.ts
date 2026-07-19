import { StageNotImplementedError } from "@/lib/news-ingestion/errors";
import type { PipelineStage, PipelineContext } from "@/lib/news-ingestion/pipeline/pipeline-stage";
import type { NormalizedArticle } from "@/lib/news-ingestion/types/article";
import type { ValidationOutput } from "@/lib/news-ingestion/types/validation";
import type { IngestionResult } from "@/lib/news-ingestion/types/results";

export type ValidateStageInput = {
  article: NormalizedArticle;
};

export type ValidateStage = PipelineStage<ValidateStageInput, ValidationOutput>;

export abstract class AbstractValidateStage implements ValidateStage {
  readonly stageId = "validate" as const;

  async execute(
    _input: ValidateStageInput,
    _context: PipelineContext,
  ): Promise<IngestionResult<ValidationOutput>> {
    throw new StageNotImplementedError(this.stageId);
  }
}
