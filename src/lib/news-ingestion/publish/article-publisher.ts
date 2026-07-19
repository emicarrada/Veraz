import { StageNotImplementedError } from "@/lib/news-ingestion/errors";
import type { PipelineContext } from "@/lib/news-ingestion/pipeline/pipeline-stage";
import type { PersistenceOutput, PublishOutput } from "@/lib/news-ingestion/types/stages-io";
import type { IngestionResult } from "@/lib/news-ingestion/types/results";

/**
 * Contract for promoting persisted articles to public feed (future).
 */
export type ArticlePublisher = {
  publish(persisted: PersistenceOutput, context: PipelineContext): Promise<IngestionResult<PublishOutput>>;
};

export abstract class AbstractArticlePublisher implements ArticlePublisher {
  async publish(
    _persisted: PersistenceOutput,
    _context: PipelineContext,
  ): Promise<IngestionResult<PublishOutput>> {
    throw new StageNotImplementedError("publish");
  }
}
