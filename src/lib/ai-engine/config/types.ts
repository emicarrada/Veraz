import type { AIMode, AIProviderId } from "@/lib/ai-engine/types/capabilities";

/**
 * Runtime configuration for the AI Engine.
 * Resolved from env / config — never from feature code.
 */
export type AIEngineConfig = {
  /** Master operating mode. */
  mode: AIMode;
  /** Active provider. `"none"` when disabled or unconfigured. */
  provider: AIProviderId;
  /**
   * When true, provider failures are logged and swallowed (soft-fail).
   * Always true for publishing paths; kept explicit for clarity.
   */
  failOpen: boolean;
};

/**
 * Safe default: platform runs with AI fully off.
 * No API keys required.
 */
export const DEFAULT_AI_ENGINE_CONFIG: AIEngineConfig = {
  mode: "disabled",
  provider: "none",
  failOpen: true,
};
