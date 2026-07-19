import { AbstractNewsProvider } from "@/lib/news-ingestion/contracts/abstract-news-provider";
import type { ProviderCapability } from "@/lib/news-ingestion/types/capabilities";

const CAPABILITIES = ["discover", "fetch", "health_check"] as const satisfies ReadonlyArray<ProviderCapability>;

/** Associated Press adapter (not implemented). */
export class APNewsProvider extends AbstractNewsProvider {
  override readonly id = "ap-news" as const;
  override readonly displayName = "AP News";

  capabilities(): ReadonlyArray<ProviderCapability> {
    return CAPABILITIES;
  }
}
