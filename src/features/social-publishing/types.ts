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

export type SocialPublicationStatus = "pending" | "exported" | "posted" | "failed";

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

export type SocialRenderer = "internal" | "canva";

export type SocialPublishConfig = {
  enabled: boolean;
  dryRun: boolean;
  publishNetworks: boolean;
  writeCaptionFiles: boolean;
  includeExcerptInCaption: boolean;
  globalHashtags: string[];
  platforms: SocialPlatform[];
  renderer: SocialRenderer;
  cardVariant: SocialCardVariant;
  canvaEnabled: boolean;
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
  publishTimeZone: string;
  canvaTemplateUrl?: string;
  canvaStoragePath: string;
  canvaProfileDir: string;
  assetsDir: string;
  exportsDir: string;
  siteUrl: string;
};
