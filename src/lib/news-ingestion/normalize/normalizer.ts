import { StageNotImplementedError } from "@/lib/news-ingestion/errors";
import type { NormalizeStage } from "@/lib/news-ingestion/pipeline/normalize-stage";
import type { PipelineContext } from "@/lib/news-ingestion/pipeline/pipeline-stage";
import type { ProviderPayload, NormalizedArticle } from "@/lib/news-ingestion/types/article";
import type { IngestionResult } from "@/lib/news-ingestion/types/results";

/**
 * Contract for provider payload → NormalizedArticle transformation.
 */
export type Normalizer = {
  normalize(payload: ProviderPayload, context: PipelineContext): Promise<IngestionResult<NormalizedArticle>>;
};

export abstract class AbstractNormalizer implements Normalizer {
  async normalize(
    _payload: ProviderPayload,
    _context: PipelineContext,
  ): Promise<IngestionResult<NormalizedArticle>> {
    throw new StageNotImplementedError("normalize");
  }
}

export type { NormalizeStage };
