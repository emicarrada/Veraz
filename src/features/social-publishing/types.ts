import type { ArticleId } from "@/domain/shared/ids";
import type { Locale } from "@/i18n/routing";
import type { NewsCategorySlug } from "@/features/news/classification/categories";
import type { SocialCardVariant } from "@/features/social-publishing/templates/card-variants";

export type SocialPlatform =
  | "x"
  | "instagram"
  | "tiktok"
  | "instagram_reels"
  | "youtube";

export type SocialPublicationStatus =
  | "pending"
  | "exported"
  | "posted"
  | "failed"
  | "delivered";

export type SocialArticleCandidate = {
  articleId: ArticleId;
  slug: string;
  title: string;
  excerpt: string;
  categorySlug: NewsCategorySlug;
  languageCode: string;
  sourceSlug: string;
  sourceName: string;
  sourceAttribution: string;
  heroImageUrl?: string;
  categoryFallbackImageUrl: string;
  locale: Locale;
  verazArticleUrl: string;
};

export type SocialPublishConfig = {
  enabled: boolean;
  dryRun: boolean;
  publishNetworks: boolean;
  writeCaptionFiles: boolean;
  includeExcerptInCaption: boolean;
  globalHashtags: string[];
  platforms: SocialPlatform[];
  cardVariant: SocialCardVariant;
  headed: boolean;
  locale: Locale;
  maxPostsPerRun: number;
  maxPostsPerDayX: number;
  maxPostsPerDayInstagram: number;
  maxPostsPerDayTiktok: number;
  maxPostsPerDayInstagramReels: number;
  maxPostsPerDayYoutube: number;
  instagramHighImpactOnly: boolean;
  instagramMinImpactScore: number;
  highReachOnly: boolean;
  minReachScore: number;
  reachTier1SourceSlugs: string[];
  reachRequireHeroForVisual: boolean;
  publishTimeZone: string;
  assetsDir: string;
  exportsDir: string;
  siteUrl: string;
};
