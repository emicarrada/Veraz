/**
 * Provider Pattern — common interface for all AI backends.
 *
 * Features and app code MUST NOT import concrete providers.
 * Only the AI Engine may construct / select a provider from config.
 *
 * Implementations (OpenAI, Gemini, Claude, Ollama, …) live under
 * `providers/<id>/` and are not present yet by design.
 */

import type { AICapability, AIProviderId } from "@/lib/ai-engine/types/capabilities";
import type { AIResult } from "@/lib/ai-engine/types/errors";
import type {
  AIArticleInput,
  AIBiasResult,
  AIContextResult,
  AIRelatedResult,
  AIReliabilityResult,
  AISummaryResult,
  AITimelineResult,
} from "@/lib/ai-engine/types/results";

export type AIProviderHealth = {
  healthy: boolean;
  detail?: string;
};

/**
 * Contract every provider adapter must satisfy.
 * Methods may return soft-failures; they must not throw for expected outages
 * when the Engine is used (Engine may still catch unexpected throws).
 */
export type AIProvider = {
  readonly id: AIProviderId;
  readonly displayName: string;

  /** Capabilities this adapter can attempt. */
  supportedCapabilities(): ReadonlyArray<AICapability>;

  /**
   * Optional readiness probe. Used for ops / mode selection — never blocks publish.
   */
  healthcheck?(): Promise<AIProviderHealth>;

  summarize(input: AIArticleInput): Promise<AIResult<AISummaryResult>>;
  enrichContext?(input: AIArticleInput): Promise<AIResult<AIContextResult>>;
  assessBias?(input: AIArticleInput): Promise<AIResult<AIBiasResult>>;
  assessReliability?(
    input: AIArticleInput,
  ): Promise<AIResult<AIReliabilityResult>>;
  buildTimeline?(input: AIArticleInput): Promise<AIResult<AITimelineResult>>;
  suggestRelated?(input: AIArticleInput): Promise<AIResult<AIRelatedResult>>;
};
