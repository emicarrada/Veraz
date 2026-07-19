import type { ProviderCapability } from "@/lib/news-ingestion/types/capabilities";
import type { ProviderHealth } from "@/lib/news-ingestion/types/health";
import type { NewsProviderId } from "@/lib/news-ingestion/types/provider-id";
import type {
  DiscoverInput,
  FetchInput,
} from "@/lib/news-ingestion/types/article";
import type {
  DiscoverResult,
  FetchResult,
} from "@/lib/news-ingestion/types/results";

/**
 * Common contract for all news provider adapters.
 *
 * Features and app code MUST NOT import concrete providers.
 * Only the News Ingestion Engine may select a provider from the registry.
 */
export type NewsProvider = {
  readonly id: NewsProviderId;
  readonly displayName: string;

  /** Capabilities this adapter supports. */
  capabilities(): ReadonlyArray<ProviderCapability>;

  /** Discover candidate items for a configured Source. */
  discover(input: DiscoverInput): Promise<DiscoverResult>;

  /** Fetch raw payload for a discovered candidate. */
  fetch(input: FetchInput): Promise<FetchResult>;

  /** Optional readiness probe — never blocks publish. */
  healthCheck?(): Promise<ProviderHealth>;
};
