import { getNewsConfig } from "@/config/accessors";
import { InvalidIngestionInputError } from "@/lib/news-ingestion/errors";
import { RssNormalizer } from "@/lib/news-ingestion/normalize/rss-normalizer";
import { RssNormalizeStage } from "@/lib/news-ingestion/pipeline/rss-normalize-stage";
import type { PipelineContext } from "@/lib/news-ingestion/pipeline/pipeline-stage";
import { RSSProvider } from "@/lib/news-ingestion/providers/rss/rss-provider";
import type { NormalizedArticle } from "@/lib/news-ingestion/types/article";
import type { IngestionResult } from "@/lib/news-ingestion/types/results";
import { ingestionFail, ingestionOk } from "@/lib/news-ingestion/utils/ingestion-result";

export type RssIngestionRunInput = {
  sourceSlug: string;
  /** Overrides config feed URL when provided. */
  feedUrl?: string;
  limit?: number;
};

export type RssIngestionRunOutput = {
  articles: ReadonlyArray<NormalizedArticle>;
  processed: number;
  failed: number;
};

export type RssIngestionRunnerOptions = {
  provider?: RSSProvider;
  normalizeStage?: RssNormalizeStage;
};

/**
 * Runs discover → fetch → normalize for a configured RSS feed.
 * Stops at NormalizedArticle — no persistence or publish.
 */
export class RssIngestionRunner {
  private readonly provider: RSSProvider;
  private readonly normalizeStage: RssNormalizeStage;

  constructor(options: RssIngestionRunnerOptions = {}) {
    this.provider = options.provider ?? new RSSProvider();
    this.normalizeStage = options.normalizeStage ?? new RssNormalizeStage();
  }

  async run(input: RssIngestionRunInput): Promise<IngestionResult<RssIngestionRunOutput>> {
    const newsConfig = getNewsConfig();
    const limit = input.limit ?? newsConfig.discoverBatchLimit;

    const discoverResult = await this.provider.discover({
      providerId: "rss",
      sourceSlug: input.sourceSlug,
      ...(input.feedUrl ? { endpoint: input.feedUrl } : {}),
      limit,
    });

    if (!discoverResult.ok) {
      return discoverResult;
    }

    const context: PipelineContext = {
      runId: `rss-${Date.now()}`,
      state: {
        runId: `rss-${Date.now()}`,
        candidateId: input.sourceSlug,
        status: "discovered",
        providerId: "rss",
        sourceSlug: input.sourceSlug,
        updatedAt: new Date().toISOString(),
        retryCount: 0,
      },
    };

    const articles: NormalizedArticle[] = [];
    let failed = 0;

    for (const candidate of discoverResult.data.candidates) {
      const fetchResult = await this.provider.fetch({ candidate });
      if (!fetchResult.ok) {
        failed += 1;
        continue;
      }

      const normalizeResult = await this.normalizeStage.execute(
        { payload: fetchResult.data.payload },
        context,
      );

      if (!normalizeResult.ok) {
        failed += 1;
        continue;
      }

      articles.push(normalizeResult.data);
    }

    if (articles.length === 0 && discoverResult.data.candidates.length > 0) {
      return ingestionFail(
        new InvalidIngestionInputError(
          "RSS ingestion produced no normalized articles.",
        ),
      );
    }

    return ingestionOk({
      articles,
      processed: articles.length,
      failed,
    });
  }
}
