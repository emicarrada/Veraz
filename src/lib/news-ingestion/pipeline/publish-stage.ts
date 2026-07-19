import { StageNotImplementedError } from "@/lib/news-ingestion/errors";
import type { PipelineStage, PipelineContext } from "@/lib/news-ingestion/pipeline/pipeline-stage";
import type { PersistenceOutput, PublishOutput } from "@/lib/news-ingestion/types/stages-io";
import type { IngestionResult } from "@/lib/news-ingestion/types/results";

export type PublishStageInput = {
  persisted: PersistenceOutput;
};

export type PublishStage = PipelineStage<PublishStageInput, PublishOutput>;

export abstract class AbstractPublishStage implements PublishStage {
  readonly stageId = "publish" as const;

  async execute(
    _input: PublishStageInput,
    _context: PipelineContext,
  ): Promise<IngestionResult<PublishOutput>> {
    throw new StageNotImplementedError(this.stageId);
  }
}
