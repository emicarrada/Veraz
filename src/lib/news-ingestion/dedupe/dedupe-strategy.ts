import { StageNotImplementedError } from "@/lib/news-ingestion/errors";
import type { PipelineContext } from "@/lib/news-ingestion/pipeline/pipeline-stage";
import type { ValidatedArticle } from "@/lib/news-ingestion/types/validation";
import type { DedupeOutput } from "@/lib/news-ingestion/types/dedupe-story";
import type { IngestionResult } from "@/lib/news-ingestion/types/results";

/**
 * Contract for duplicate detection strategies.
 */
export type DedupeStrategy = {
  evaluate(validated: ValidatedArticle, context: PipelineContext): Promise<IngestionResult<DedupeOutput>>;
};

export abstract class AbstractDedupeStrategy implements DedupeStrategy {
  async evaluate(
    _validated: ValidatedArticle,
    _context: PipelineContext,
  ): Promise<IngestionResult<DedupeOutput>> {
    throw new StageNotImplementedError("dedupe");
  }
}
