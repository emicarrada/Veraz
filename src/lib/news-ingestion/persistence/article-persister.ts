import { StageNotImplementedError } from "@/lib/news-ingestion/errors";
import type { PipelineContext } from "@/lib/news-ingestion/pipeline/pipeline-stage";
import type { StoryStageOutput } from "@/lib/news-ingestion/types/dedupe-story";
import type { PersistenceOutput } from "@/lib/news-ingestion/types/stages-io";
import type { IngestionResult } from "@/lib/news-ingestion/types/results";

/**
 * Contract for mapping pipeline output to domain persistence (future Supabase/repos).
 */
export type ArticlePersister = {
  persist(item: StoryStageOutput, pipelineRunId: string, context: PipelineContext): Promise<IngestionResult<PersistenceOutput>>;
};

export abstract class AbstractArticlePersister implements ArticlePersister {
  async persist(
    _item: StoryStageOutput,
    _pipelineRunId: string,
    _context: PipelineContext,
  ): Promise<IngestionResult<PersistenceOutput>> {
    throw new StageNotImplementedError("persistence");
  }
}
