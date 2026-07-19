import type { Source } from "@/domain/catalog/source";
import type { Slug } from "@/domain/shared/value-objects";

export type EnsureRssSourceInput = {
  slug: Slug;
  feedUrl: string;
  defaultLanguageCode?: string;
  name?: string;
  homepageUrl?: string;
};

export type SourceRepository = {
  findBySlug(slug: Slug): Promise<Source | null>;
  /** Creates or updates a source row for RSS ingestion. */
  ensureRssSource(input: EnsureRssSourceInput): Promise<Source>;
};
