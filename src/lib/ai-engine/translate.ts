import { isAIEnabled } from "@/lib/ai-engine/config";
import type { Locale } from "@/i18n/routing";

export type AITranslateInput = {
  locale: Locale;
  sourceLocale: string;
  title: string;
  excerpt: string;
  bodyExcerpt?: string;
};

export type AITranslateResult = {
  title: string;
  excerpt: string;
  bodyExcerpt?: string;
};

/**
 * Translates article fields via AI Engine when enabled.
 * Fail-open: returns null when AI is disabled or no provider runtime exists.
 */
export async function translateArticleContent(
  input: AITranslateInput,
): Promise<AITranslateResult | null> {
  if (!isAIEnabled()) {
    return null;
  }

  // Provider runtime not wired yet — fail-open per ADR 0003.
  void input;
  return null;
}
