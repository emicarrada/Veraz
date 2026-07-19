import { AbstractNewsProvider } from "@/lib/news-ingestion/contracts/abstract-news-provider";
import type { ProviderCapability } from "@/lib/news-ingestion/types/capabilities";

const CAPABILITIES = ["discover", "fetch", "health_check"] as const satisfies ReadonlyArray<ProviderCapability>;

/** Reuters wire adapter (not implemented). */
export class ReutersProvider extends AbstractNewsProvider {
  override readonly id = "reuters" as const;
  override readonly displayName = "Reuters";

  capabilities(): ReadonlyArray<ProviderCapability> {
    return CAPABILITIES;
  }
}
