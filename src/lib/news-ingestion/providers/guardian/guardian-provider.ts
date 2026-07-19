import { AbstractNewsProvider } from "@/lib/news-ingestion/contracts/abstract-news-provider";
import type { ProviderCapability } from "@/lib/news-ingestion/types/capabilities";

const CAPABILITIES = ["discover", "fetch", "health_check"] as const satisfies ReadonlyArray<ProviderCapability>;

/** The Guardian Open Platform adapter (not implemented). */
export class GuardianProvider extends AbstractNewsProvider {
  override readonly id = "guardian" as const;
  override readonly displayName = "The Guardian";

  capabilities(): ReadonlyArray<ProviderCapability> {
    return CAPABILITIES;
  }
}
