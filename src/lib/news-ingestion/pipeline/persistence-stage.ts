import { StageNotImplementedError } from "@/lib/news-ingestion/errors";
import type { PipelineStage, PipelineContext } from "@/lib/news-ingestion/pipeline/pipeline-stage";
import type { ReadyArticle, PersistenceOutput } from "@/lib/news-ingestion/types/stages-io";
import type { StoryStageOutput } from "@/lib/news-ingestion/types/dedupe-story";
import type { IngestionResult } from "@/lib/news-ingestion/types/results";

export type PersistenceStageInput = {
  item: StoryStageOutput;
  pipelineRunId: string;
};

export type PersistenceStage = PipelineStage<PersistenceStageInput, PersistenceOutput>;

export abstract class AbstractPersistenceStage implements PersistenceStage {
  readonly stageId = "persistence" as const;

  async execute(
    _input: PersistenceStageInput,
    _context: PipelineContext,
  ): Promise<IngestionResult<PersistenceOutput>> {
    throw new StageNotImplementedError(this.stageId);
  }
}

export type { ReadyArticle };
