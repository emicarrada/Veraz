import { AbstractNewsProvider } from "@/lib/news-ingestion/contracts/abstract-news-provider";
import type { ProviderCapability } from "@/lib/news-ingestion/types/capabilities";

const CAPABILITIES = ["discover", "fetch", "health_check"] as const satisfies ReadonlyArray<ProviderCapability>;

/** Custom / internal feeds adapter (not implemented). */
export class CustomProvider extends AbstractNewsProvider {
  override readonly id = "custom" as const;
  override readonly displayName = "Custom";

  capabilities(): ReadonlyArray<ProviderCapability> {
    return CAPABILITIES;
  }
}
