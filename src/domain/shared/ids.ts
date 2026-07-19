/**
 * Opaque domain identifiers.
 * Runtime values are strings; the brand prevents accidental mixing.
 */

export type Brand<T, TBrand extends string> = T & {
  readonly __brand: TBrand;
};

export type ArticleId = Brand<string, "ArticleId">;
export type SourceId = Brand<string, "SourceId">;
export type CategoryId = Brand<string, "CategoryId">;
export type TopicId = Brand<string, "TopicId">;
export type TagId = Brand<string, "TagId">;
export type CountryId = Brand<string, "CountryId">;
export type LanguageId = Brand<string, "LanguageId">;
export type StoryId = Brand<string, "StoryId">;
export type MediaId = Brand<string, "MediaId">;
export type ReferenceId = Brand<string, "ReferenceId">;
export type TimelineEventId = Brand<string, "TimelineEventId">;
export type RelatedArticleId = Brand<string, "RelatedArticleId">;
export type AIAnalysisId = Brand<string, "AIAnalysisId">;
export type UserId = Brand<string, "UserId">;
export type BookmarkId = Brand<string, "BookmarkId">;
export type NotificationId = Brand<string, "NotificationId">;
export type PremiumPlanId = Brand<string, "PremiumPlanId">;
export type PremiumSubscriptionId = Brand<string, "PremiumSubscriptionId">;
export type BookmarkCollectionId = Brand<string, "BookmarkCollectionId">;
