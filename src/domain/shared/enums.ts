export type SourceStatus = "active" | "paused" | "suspended" | "archived";

export type SourceTrustTier = "high" | "medium" | "low" | "unrated";

export type ArticleStatus =
  | "ingested"
  | "published"
  | "unpublished"
  | "archived"
  | "withdrawn";

export type ContentFormat = "text" | "image" | "video" | "audio" | "mixed";

export type CatalogStatus = "active" | "deprecated" | "archived";

export type StoryStatus = "developing" | "resolved" | "archived";

export type StoryArticleRole = "lead" | "coverage" | "analysis" | "opinion_label";

export type MediaKind = "image" | "video" | "audio" | "document";

export type ReferenceKind =
  | "original"
  | "primary_source"
  | "supporting"
  | "correction";

export type TimelineEventOrigin = "editorial" | "ai_suggested" | "ingest";

export type TimelineEventStatus = "active" | "retracted";

export type RelationType =
  | "same_story"
  | "background"
  | "update"
  | "contrast"
  | "translation";

export type RelationOrigin = "editorial" | "algorithmic" | "ai_suggested";

export type RelationStatus = "active" | "rejected";

export type AIAnalysisStatus =
  | "pending"
  | "ready"
  | "failed"
  | "stale"
  | "disabled";

export type UserStatus = "active" | "suspended" | "deleted";

export type NotificationKind =
  | "story_update"
  | "topic_digest"
  | "system"
  | "premium";

export type NotificationStatus = "unread" | "read" | "archived";

export type PremiumPlanStatus = "active" | "retired";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "expired";
