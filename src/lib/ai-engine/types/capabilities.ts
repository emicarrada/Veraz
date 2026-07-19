/**
 * AI capability surface exposed by the AI Engine.
 * Providers may support a subset; the Engine gates calls by AI mode + capability.
 */
export type AICapability =
  | "summarize"
  | "context"
  | "bias"
  | "reliability"
  | "timeline"
  | "related";

/**
 * Operating modes for the AI Engine.
 * Higher modes include the capabilities of lower enabled modes.
 *
 * - disabled: no AI calls; platform runs without enrichment
 * - summaries: objective summaries only
 * - context: summaries + contextual enrichment
 * - full: all configured AI capabilities
 */
export type AIMode = "disabled" | "summaries" | "context" | "full";

/**
 * Provider identifiers. Extensible without changing feature code.
 * `"none"` is the default when AI is off or no provider is configured.
 */
export type AIProviderId =
  | "none"
  | "openai"
  | "gemini"
  | "anthropic"
  | "openrouter"
  | "ollama"
  | "local"
  | (string & {});

export const AI_MODE_CAPABILITIES: Record<AIMode, ReadonlyArray<AICapability>> = {
  disabled: [],
  summaries: ["summarize"],
  context: ["summarize", "context"],
  full: ["summarize", "context", "bias", "reliability", "timeline", "related"],
};
