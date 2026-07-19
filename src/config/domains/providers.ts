import type { AIProviderId } from "@/lib/ai-engine/types/capabilities";
import type { KnownNewsProviderId } from "@/lib/news-ingestion/types/provider-id";
import { NEWS_PROVIDER_IDS } from "@/lib/news-ingestion/types/provider-id";

/**
 * Declarative slot for a provider adapter in config (not runtime registry).
 */
export type ProviderSlotConfig = {
  id: string;
  label: string;
  enabled: boolean;
};

export type AIProviderSlotConfig = ProviderSlotConfig & {
  id: AIProviderId;
  credentialEnvKey?: string;
};

export type NewsProviderSlotConfig = ProviderSlotConfig & {
  id: KnownNewsProviderId;
};

export type AIProvidersConfig = {
  activeProviderId: AIProviderId;
  slots: ReadonlyArray<AIProviderSlotConfig>;
};

export type NewsProvidersConfig = {
  /** Subset of registered slots enabled for ingestion. */
  enabledProviderIds: ReadonlyArray<KnownNewsProviderId>;
  slots: ReadonlyArray<NewsProviderSlotConfig>;
};

export type ProviderConfig = {
  ai: AIProvidersConfig;
  news: NewsProvidersConfig;
};

/** Default registry — all slots disabled until explicitly enabled via env (future). */
export const DEFAULT_NEWS_PROVIDER_SLOTS: ReadonlyArray<NewsProviderSlotConfig> =
  NEWS_PROVIDER_IDS.map((id) => ({
    id,
    label: id,
    enabled: false,
  }));

export const DEFAULT_AI_PROVIDER_SLOTS: ReadonlyArray<AIProviderSlotConfig> = [
  { id: "none", label: "None", enabled: true },
  { id: "openai", label: "OpenAI", enabled: false, credentialEnvKey: "OPENAI_API_KEY" },
  { id: "gemini", label: "Google Gemini", enabled: false, credentialEnvKey: "GEMINI_API_KEY" },
  { id: "anthropic", label: "Anthropic", enabled: false, credentialEnvKey: "ANTHROPIC_API_KEY" },
  { id: "openrouter", label: "OpenRouter", enabled: false, credentialEnvKey: "OPENROUTER_API_KEY" },
  { id: "ollama", label: "Ollama", enabled: false, credentialEnvKey: "OLLAMA_BASE_URL" },
  { id: "local", label: "Local", enabled: false },
];

export const DEFAULT_PROVIDER_CONFIG: ProviderConfig = {
  ai: {
    activeProviderId: "none",
    slots: DEFAULT_AI_PROVIDER_SLOTS,
  },
  news: {
    enabledProviderIds: [],
    slots: DEFAULT_NEWS_PROVIDER_SLOTS,
  },
};
