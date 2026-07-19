import { getRssFeedBySourceSlug } from "@/config/accessors";
import { SupabaseNotConfiguredError } from "@/lib/supabase/errors";
import {
  createLanguageResolverFromArticleRepository,
  NormalizedArticlePersistenceService,
} from "@/lib/news-ingestion/persistence/normalized-article-persistence-service";
import {
  RssIngestionRunner,
  type RssIngestionRunInput,
} from "@/lib/news-ingestion/pipeline/rss-ingestion-runner";
import type { IngestionResult } from "@/lib/news-ingestion/types/results";
import { ingestionFail } from "@/lib/news-ingestion/utils/ingestion-result";
import { PersistenceFailedError } from "@/lib/news-ingestion/errors";
import { createContentRepositories } from "@/lib/repositories/factory";
import type { NormalizedArticlePersistenceOutput } from "@/lib/news-ingestion/persistence/normalized-article-persistence-service";

export type RssIngestionPersistenceOutput = {
  normalized: number;
  persistence: NormalizedArticlePersistenceOutput;
};

export type RssIngestionPersistenceRunnerOptions = {
  ingestionRunner?: RssIngestionRunner;
  persistenceService?: NormalizedArticlePersistenceService;
};

/**
 * RSS discover → fetch → normalize → persist (Supabase via repositories).
 */
export class RssIngestionPersistenceRunner {
  private readonly ingestionRunner: RssIngestionRunner;
  private readonly persistenceService: NormalizedArticlePersistenceService | null;

  constructor(options: RssIngestionPersistenceRunnerOptions = {}) {
    this.ingestionRunner = options.ingestionRunner ?? new RssIngestionRunner();

    if (options.persistenceService) {
      this.persistenceService = options.persistenceService;
      return;
    }

    const repos = createContentRepositories();
    if (!repos) {
      this.persistenceService = null;
      return;
    }

    this.persistenceService = new NormalizedArticlePersistenceService({
      sourceRepository: repos.sourceRepository,
      articleRepository: repos.articleRepository,
      languageResolver: createLanguageResolverFromArticleRepository(
        repos.supabaseArticleRepository,
      ),
      feedLookup: getRssFeedBySourceSlug,
    });
  }

  async run(
    input: RssIngestionRunInput,
  ): Promise<IngestionResult<RssIngestionPersistenceOutput>> {
    if (!this.persistenceService) {
      return ingestionFail(
        new PersistenceFailedError(
          "Supabase persistence is not configured.",
          { retryable: false, cause: new SupabaseNotConfiguredError() },
        ),
      );
    }

    const ingestResult = await this.ingestionRunner.run(input);
    if (!ingestResult.ok) {
      return ingestResult;
    }

    const persistResult = await this.persistenceService.persistMany(
      ingestResult.data.articles,
    );

    if (!persistResult.ok) {
      return persistResult;
    }

    return {
      ok: true,
      data: {
        normalized: ingestResult.data.processed,
        persistence: persistResult.data,
      },
    };
  }
}

export function createRssIngestionPersistenceRunner(): RssIngestionPersistenceRunner {
  return new RssIngestionPersistenceRunner();
}
