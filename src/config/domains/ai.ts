import type { AIEngineConfig } from "@/lib/ai-engine/config/types";
import type { AIProviderId } from "@/lib/ai-engine/types/capabilities";

/**
 * AI Engine configuration — mirrors engine contracts, resolved from Config Engine.
 */
export type AIConfig = {
  engine: AIEngineConfig;
  /** When set, name of the env key that holds the active provider credential (future). */
  credentialEnvKey?: string;
};

/** Maps provider id → env key for credentials (declarative only; no secret values). */
export type AIProviderCredentialMap = Partial<Record<AIProviderId, string>>;

export const AI_PROVIDER_CREDENTIAL_ENV_KEYS: AIProviderCredentialMap = {
  openai: "OPENAI_API_KEY",
  gemini: "GEMINI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  openrouter: "OPENROUTER_API_KEY",
  ollama: "OLLAMA_BASE_URL",
};
