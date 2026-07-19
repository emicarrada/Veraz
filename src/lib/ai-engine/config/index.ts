/**
 * AI Engine configuration access.
 * Resolved exclusively via Config Engine — no direct env reads.
 */

export {
  DEFAULT_AI_ENGINE_CONFIG,
  type AIEngineConfig,
} from "@/lib/ai-engine/config/types";

import { getAIConfig } from "@/config/accessors";
import type { AIEngineConfig } from "@/lib/ai-engine/config/types";

/**
 * Returns the effective AI engine config from Config Engine.
 */
export function getAIEngineConfig(): AIEngineConfig {
  return getAIConfig().engine;
}

export function isAIEnabled(): boolean {
  const { engine } = getAIConfig();
  return engine.mode !== "disabled" && engine.provider !== "none";
}
