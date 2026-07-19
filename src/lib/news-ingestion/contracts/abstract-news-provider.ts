import { ProviderNotImplementedError } from "@/lib/news-ingestion/errors";
import type { NewsProvider } from "@/lib/news-ingestion/contracts/news-provider";
import type { ProviderCapability } from "@/lib/news-ingestion/types/capabilities";
import type {
  DiscoverInput,
  FetchInput,
} from "@/lib/news-ingestion/types/article";
import type {
  DiscoverResult,
  FetchResult,
} from "@/lib/news-ingestion/types/results";
import type { ProviderHealth } from "@/lib/news-ingestion/types/health";
import type { NewsProviderId } from "@/lib/news-ingestion/types/provider-id";

/**
 * Base class for provider adapters.
 * Default methods throw typed not-implemented errors.
 */
export abstract class AbstractNewsProvider implements NewsProvider {
  abstract readonly id: NewsProviderId;
  abstract readonly displayName: string;
  abstract capabilities(): ReadonlyArray<ProviderCapability>;

  async discover(_input: DiscoverInput): Promise<DiscoverResult> {
    throw new ProviderNotImplementedError(this.id, "discover");
  }

  async fetch(_input: FetchInput): Promise<FetchResult> {
    throw new ProviderNotImplementedError(this.id, "fetch");
  }

  async healthCheck(): Promise<ProviderHealth> {
    throw new ProviderNotImplementedError(this.id, "healthCheck");
  }
}
