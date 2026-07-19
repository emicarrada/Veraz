import { StageNotImplementedError } from "@/lib/news-ingestion/errors";
import type { PipelineStage, PipelineContext } from "@/lib/news-ingestion/pipeline/pipeline-stage";
import type { ValidatedArticle } from "@/lib/news-ingestion/types/validation";
import type { DedupeOutput } from "@/lib/news-ingestion/types/dedupe-story";
import type { IngestionResult } from "@/lib/news-ingestion/types/results";

export type DedupeStageInput = {
  validated: ValidatedArticle;
};

export type DedupeStage = PipelineStage<DedupeStageInput, DedupeOutput>;

export abstract class AbstractDedupeStage implements DedupeStage {
  readonly stageId = "dedupe" as const;

  async execute(
    _input: DedupeStageInput,
    _context: PipelineContext,
  ): Promise<IngestionResult<DedupeOutput>> {
    throw new StageNotImplementedError(this.stageId);
  }
}
