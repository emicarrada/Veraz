import { StageNotImplementedError } from "@/lib/news-ingestion/errors";
import type { PipelineStage, PipelineContext } from "@/lib/news-ingestion/pipeline/pipeline-stage";
import type { DiscoverInput, DiscoverOutput } from "@/lib/news-ingestion/types/article";
import type { IngestionResult } from "@/lib/news-ingestion/types/results";

export type DiscoverStageInput = {
  discover: DiscoverInput;
};

export type DiscoverStage = PipelineStage<DiscoverStageInput, DiscoverOutput>;

export abstract class AbstractDiscoverStage implements DiscoverStage {
  readonly stageId = "discover" as const;

  async execute(
    _input: DiscoverStageInput,
    _context: PipelineContext,
  ): Promise<IngestionResult<DiscoverOutput>> {
    throw new StageNotImplementedError(this.stageId);
  }
}
