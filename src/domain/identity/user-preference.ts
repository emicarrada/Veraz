import type {
  CategoryId,
  CountryId,
  LanguageId,
  TopicId,
  UserId,
} from "@/domain/shared/ids";

export type UserPreference = {
  userId: UserId;
  uiLanguageId?: LanguageId;
  contentLanguageIds: LanguageId[];
  followedCountryIds: CountryId[];
  followedTopicIds: TopicId[];
  followedCategoryIds: CategoryId[];
  reduceMotion?: boolean;
  /** When false, UI hides enrichment even if AIAnalysis exists. */
  showAiEnrichment: boolean;
};
