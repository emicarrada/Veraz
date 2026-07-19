import { AbstractNewsProvider } from "@/lib/news-ingestion/contracts/abstract-news-provider";
import type { ProviderCapability } from "@/lib/news-ingestion/types/capabilities";

const CAPABILITIES = ["discover", "fetch", "health_check"] as const satisfies ReadonlyArray<ProviderCapability>;

/** NewsAPI adapter (not implemented). */
export class NewsAPIProvider extends AbstractNewsProvider {
  override readonly id = "newsapi" as const;
  override readonly displayName = "NewsAPI";

  capabilities(): ReadonlyArray<ProviderCapability> {
    return CAPABILITIES;
  }
}
