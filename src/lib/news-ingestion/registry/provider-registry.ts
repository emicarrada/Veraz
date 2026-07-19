import { DuplicateProviderRegistrationError, ProviderNotRegisteredError } from "@/lib/news-ingestion/errors";
import type { NewsProvider } from "@/lib/news-ingestion/contracts/news-provider";
import type { NewsProviderId } from "@/lib/news-ingestion/types/provider-id";

/**
 * In-memory provider registry.
 * Does not auto-instantiate or auto-register any adapter.
 */
export class ProviderRegistry {
  private readonly providers = new Map<NewsProviderId, NewsProvider>();

  register(provider: NewsProvider): void {
    if (this.providers.has(provider.id)) {
      throw new DuplicateProviderRegistrationError(provider.id);
    }
    this.providers.set(provider.id, provider);
  }

  unregister(providerId: NewsProviderId): boolean {
    return this.providers.delete(providerId);
  }

  get(providerId: NewsProviderId): NewsProvider | undefined {
    return this.providers.get(providerId);
  }

  getOrThrow(providerId: NewsProviderId): NewsProvider {
    const provider = this.get(providerId);
    if (!provider) {
      throw new ProviderNotRegisteredError(providerId);
    }
    return provider;
  }

  has(providerId: NewsProviderId): boolean {
    return this.providers.has(providerId);
  }

  listIds(): ReadonlyArray<NewsProviderId> {
    return [...this.providers.keys()];
  }

  list(): ReadonlyArray<NewsProvider> {
    return [...this.providers.values()];
  }

  clear(): void {
    this.providers.clear();
  }

  get size(): number {
    return this.providers.size;
  }
}
