import { StageNotImplementedError } from "@/lib/news-ingestion/errors";
import type { PipelineStage, PipelineContext } from "@/lib/news-ingestion/pipeline/pipeline-stage";
import type { StoryStageOutput } from "@/lib/news-ingestion/types/dedupe-story";
import type { EnrichmentOutput } from "@/lib/news-ingestion/types/stages-io";
import type { IngestionResult } from "@/lib/news-ingestion/types/results";

export type EnrichmentStageInput = {
  item: StoryStageOutput;
};

export type EnrichmentStage = PipelineStage<EnrichmentStageInput, EnrichmentOutput>;

export abstract class AbstractEnrichmentStage implements EnrichmentStage {
  readonly stageId = "enrichment" as const;

  async execute(
    _input: EnrichmentStageInput,
    _context: PipelineContext,
  ): Promise<IngestionResult<EnrichmentOutput>> {
    throw new StageNotImplementedError(this.stageId);
  }
}
