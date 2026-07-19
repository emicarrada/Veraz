import { StageNotImplementedError } from "@/lib/news-ingestion/errors";
import type { PipelineContext } from "@/lib/news-ingestion/pipeline/pipeline-stage";
import type { DedupeOutput, StoryStageOutput } from "@/lib/news-ingestion/types/dedupe-story";
import type { IngestionResult } from "@/lib/news-ingestion/types/results";

/**
 * Contract for Story clustering / assignment.
 */
export type StoryEngine = {
  assign(deduped: DedupeOutput, context: PipelineContext): Promise<IngestionResult<StoryStageOutput>>;
};

export abstract class AbstractStoryEngine implements StoryEngine {
  async assign(
    _deduped: DedupeOutput,
    _context: PipelineContext,
  ): Promise<IngestionResult<StoryStageOutput>> {
    throw new StageNotImplementedError("story");
  }
}
