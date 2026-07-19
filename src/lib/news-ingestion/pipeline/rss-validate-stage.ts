import type { ValidateStage } from "@/lib/news-ingestion/pipeline/validate-stage";
import type { PipelineContext } from "@/lib/news-ingestion/pipeline/pipeline-stage";
import type { NormalizedArticle } from "@/lib/news-ingestion/types/article";
import type { ValidationOutput } from "@/lib/news-ingestion/types/validation";
import type { IngestionResult } from "@/lib/news-ingestion/types/results";
import { validateNormalizedArticle } from "@/lib/news-ingestion/validation/rss-article-validator";
import { ingestionOk } from "@/lib/news-ingestion/utils/ingestion-result";

export type RssValidateStageInput = {
  article: NormalizedArticle;
};

/**
 * Pipeline validate stage for RSS normalized articles.
 */
export class RssValidateStage implements ValidateStage {
  readonly stageId = "validate" as const;

  execute(
    input: RssValidateStageInput,
    _context: PipelineContext,
  ): Promise<IngestionResult<ValidationOutput>> {
    const result = validateNormalizedArticle(input.article);
    return Promise.resolve(ingestionOk(result));
  }
}
