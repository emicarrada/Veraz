import type { NewsProviderId } from "@/lib/news-ingestion/types/provider-id";

export type ProviderHealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown";

export type ProviderHealth = {
  providerId: NewsProviderId;
  status: ProviderHealthStatus;
  checkedAt: string;
  detail?: string;
  latencyMs?: number;
};
