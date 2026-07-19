/**
 * AI Engine facade contract.
 * Application / features talk ONLY to this surface — never to providers.
 */

import type { AICapability, AIMode, AIProviderId } from "@/lib/ai-engine/types/capabilities";
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

export type AIEngineStatus = {
  mode: AIMode;
  enabled: boolean;
  providerId: AIProviderId;
};

/**
 * Public Engine API (to be implemented in a later phase).
 * Soft-fails when disabled or when the provider errors.
 */
export type AIEngine = {
  getStatus(): AIEngineStatus;
  isEnabled(): boolean;
  supports(capability: AICapability): boolean;

  summarize(input: AIArticleInput): Promise<AIResult<AISummaryResult>>;
  enrichContext(input: AIArticleInput): Promise<AIResult<AIContextResult>>;
  assessBias(input: AIArticleInput): Promise<AIResult<AIBiasResult>>;
  assessReliability(
    input: AIArticleInput,
  ): Promise<AIResult<AIReliabilityResult>>;
  buildTimeline(input: AIArticleInput): Promise<AIResult<AITimelineResult>>;
  suggestRelated(input: AIArticleInput): Promise<AIResult<AIRelatedResult>>;
};
