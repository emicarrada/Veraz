import { AbstractNewsProvider } from "@/lib/news-ingestion/contracts/abstract-news-provider";
import type { ProviderCapability } from "@/lib/news-ingestion/types/capabilities";

const CAPABILITIES = ["discover", "fetch", "stream", "health_check"] as const satisfies ReadonlyArray<ProviderCapability>;

/** GDELT adapter (not implemented). */
export class GDELTProvider extends AbstractNewsProvider {
  override readonly id = "gdelt" as const;
  override readonly displayName = "GDELT";

  capabilities(): ReadonlyArray<ProviderCapability> {
    return CAPABILITIES;
  }
}
