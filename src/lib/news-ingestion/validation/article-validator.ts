import { StageNotImplementedError } from "@/lib/news-ingestion/errors";
import type { PipelineContext } from "@/lib/news-ingestion/pipeline/pipeline-stage";
import type { NormalizedArticle } from "@/lib/news-ingestion/types/article";
import type { ValidationOutput } from "@/lib/news-ingestion/types/validation";
import type { IngestionResult } from "@/lib/news-ingestion/types/results";

/**
 * Contract for NormalizedArticle validation rules.
 */
export type ArticleValidator = {
  validate(article: NormalizedArticle, context: PipelineContext): Promise<IngestionResult<ValidationOutput>>;
};

export abstract class AbstractArticleValidator implements ArticleValidator {
  async validate(
    _article: NormalizedArticle,
    _context: PipelineContext,
  ): Promise<IngestionResult<ValidationOutput>> {
    throw new StageNotImplementedError("validate");
  }
}
