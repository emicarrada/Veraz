import type { StoryArticleRole } from "@/domain/shared/enums";

import type { ValidatedArticle } from "@/lib/news-ingestion/types/validation";

export type DedupeDecisionType = "skip" | "merge" | "link" | "new";

export type DedupeDecision = {
  type: DedupeDecisionType;
  canonicalUrlFingerprint?: string;
  existingArticleId?: string;
  reason: string;
  decidedAt: string;
};

export type DedupeOutput = {
  article: ValidatedArticle;
  decision: DedupeDecision;
};

export type StoryAssignmentAction = "join_existing" | "create_new" | "none";

export type StoryAssignment = {
  action: StoryAssignmentAction;
  storyId?: string;
  storySlug?: string;
  role: StoryArticleRole;
  confidence?: number;
  assignedAt: string;
};

export type StoryStageOutput = {
  article: ValidatedArticle;
  dedupe: DedupeDecision;
  story: StoryAssignment;
};
