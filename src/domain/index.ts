/**
 * Pure domain layer — types and vocabulary only.
 *
 * Rules:
 * - No React, no Supabase, no AI Engine SDKs, no HTTP.
 * - No business logic / use-cases here.
 * - Infrastructure and features depend on this layer; never the reverse.
 *
 * See docs/domain.md for the full conceptual model.
 */

export * from "@/domain/shared/ids";
export * from "@/domain/shared/enums";
export * from "@/domain/shared/value-objects";

export * from "@/domain/catalog/source";
export * from "@/domain/catalog/category";
export * from "@/domain/catalog/topic";
export * from "@/domain/catalog/tag";
export * from "@/domain/catalog/country";
export * from "@/domain/catalog/language";
export * from "@/domain/catalog/associations";

export * from "@/domain/content/article";
export * from "@/domain/content/media";
export * from "@/domain/content/reference";
export * from "@/domain/content/timeline-event";

export * from "@/domain/clustering/story";
export * from "@/domain/clustering/related-article";

export * from "@/domain/intelligence/ai-analysis";

export * from "@/domain/identity/user-profile";
export * from "@/domain/identity/user-preference";

export * from "@/domain/engagement/bookmark";
export * from "@/domain/engagement/notification";

export * from "@/domain/premium/premium-plan";
export * from "@/domain/premium/premium-subscription";
