import type { ArticleId, AIAnalysisId, StoryId } from "@/domain/shared/ids";
import type { AIAnalysisStatus } from "@/domain/shared/enums";
import type { Instant, LocaleCode } from "@/domain/shared/value-objects";

/**
 * Optional enrichment satellite. Articles remain valid without this entity.
 * Produced via AI Engine mapping in the application layer — domain stays vendor-agnostic.
 */
export type AIAnalysis = {
  id: AIAnalysisId;
  articleId: ArticleId;
  version: number;
  status: AIAnalysisStatus;
  /** Echo of AI Engine mode used when generated. */
  mode: "disabled" | "summaries" | "context" | "full";
  /** Opaque provider id — not an SDK import. */
  providerId: string;
  modelLabel?: string;
  locale?: LocaleCode;
  summary?: string;
  context?: string;
  biasAssessment?: string;
  biasExplanation?: string;
  reliabilityLabel?: string;
  reliabilityExplanation?: string;
  sourceRefs: string[];
  generatedAt?: Instant;
  errorCode?: string;
  storyId?: StoryId;
};
