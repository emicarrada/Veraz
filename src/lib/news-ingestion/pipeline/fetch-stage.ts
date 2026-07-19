import { StageNotImplementedError } from "@/lib/news-ingestion/errors";
import type { PipelineStage, PipelineContext } from "@/lib/news-ingestion/pipeline/pipeline-stage";
import type { FetchInput, FetchOutput } from "@/lib/news-ingestion/types/article";
import type { IngestionResult } from "@/lib/news-ingestion/types/results";

export type FetchStageInput = {
  fetch: FetchInput;
};

export type FetchStageOutput = FetchOutput;

export type FetchStage = PipelineStage<FetchStageInput, FetchStageOutput>;

export abstract class AbstractFetchStage implements FetchStage {
  readonly stageId = "fetch" as const;

  async execute(
    _input: FetchStageInput,
    _context: PipelineContext,
  ): Promise<IngestionResult<FetchStageOutput>> {
    throw new StageNotImplementedError(this.stageId);
  }
}
