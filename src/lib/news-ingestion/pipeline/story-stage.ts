import { StageNotImplementedError } from "@/lib/news-ingestion/errors";
import type { PipelineStage, PipelineContext } from "@/lib/news-ingestion/pipeline/pipeline-stage";
import type { DedupeOutput } from "@/lib/news-ingestion/types/dedupe-story";
import type { StoryStageOutput } from "@/lib/news-ingestion/types/dedupe-story";
import type { IngestionResult } from "@/lib/news-ingestion/types/results";

export type StoryStageInput = {
  deduped: DedupeOutput;
};

export type StoryStage = PipelineStage<StoryStageInput, StoryStageOutput>;

export abstract class AbstractStoryStage implements StoryStage {
  readonly stageId = "story" as const;

  async execute(
    _input: StoryStageInput,
    _context: PipelineContext,
  ): Promise<IngestionResult<StoryStageOutput>> {
    throw new StageNotImplementedError(this.stageId);
  }
}
