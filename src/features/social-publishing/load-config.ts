import type { Locale } from "@/i18n/routing";
import {
  DEFAULT_SOCIAL_CARD_VARIANT,
  SOCIAL_CARD_VARIANTS,
  type SocialCardVariant,
} from "@/features/social-publishing/templates/card-variants";
import type { SocialPublishConfig, SocialPlatform } from "@/features/social-publishing/types";

function parseBool(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined || value.trim() === "") return defaultValue;
  return value.trim().toLowerCase() === "true";
}

function parseLocale(value: string | undefined): Locale {
  return value?.trim().toLowerCase() === "en" ? "en" : "es";
}

function parseCardVariant(value: string | undefined): SocialCardVariant {
  const raw = value?.trim().toLowerCase();
  if (raw && raw in SOCIAL_CARD_VARIANTS) return raw as SocialCardVariant;
  return DEFAULT_SOCIAL_CARD_VARIANT;
}

const VALID_PLATFORMS: SocialPlatform[] = [
  "x",
  "instagram",
  "tiktok",
  "instagram_reels",
  "youtube",
];

function parsePlatforms(value: string | undefined): SocialPlatform[] {
  const raw = value?.trim();
  if (!raw) return ["x", "instagram"];
  const parsed = raw
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter((part): part is SocialPlatform => VALID_PLATFORMS.includes(part as SocialPlatform));
  return parsed.length > 0 ? parsed : ["x", "instagram"];
}

function parseHashtags(value: string | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(/[\s,]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));
}

function parseIntEnv(value: string | undefined, defaultValue: number, min: number, max: number): number {
  const raw = value?.trim();
  if (!raw) return defaultValue;
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n)) return defaultValue;
  return Math.max(min, Math.min(max, n));
}

export function loadSocialPublishConfig(env: NodeJS.ProcessEnv = process.env): SocialPublishConfig {
  const maxRaw = env.SOCIAL_MAX_POSTS_PER_RUN?.trim();
  const maxPostsPerRun = maxRaw ? Math.max(1, Math.min(20, Number.parseInt(maxRaw, 10) || 3)) : 3;

  const autoPublish = parseBool(env.SOCIAL_AUTO_PUBLISH, false);

  return {
    enabled: parseBool(env.SOCIAL_PUBLISHING_ENABLED, false),
    dryRun: autoPublish ? false : parseBool(env.SOCIAL_DRY_RUN, true),
    publishNetworks: autoPublish ? true : parseBool(env.SOCIAL_PUBLISH_NETWORKS, false),
    writeCaptionFiles: parseBool(env.SOCIAL_WRITE_CAPTION_FILES, true),
    includeExcerptInCaption: parseBool(env.SOCIAL_CAPTION_INCLUDE_EXCERPT, false),
    globalHashtags: parseHashtags(env.SOCIAL_HASHTAGS),
    platforms: parsePlatforms(env.SOCIAL_PLATFORMS),
    cardVariant: parseCardVariant(env.SOCIAL_CARD_VARIANT),
    headed: parseBool(env.SOCIAL_HEADED, false),
    locale: parseLocale(env.SOCIAL_LOCALE),
    maxPostsPerRun,
    maxPostsPerDayX: parseIntEnv(env.SOCIAL_X_MAX_POSTS_PER_DAY, 6, 1, 24),
    maxPostsPerDayInstagram: parseIntEnv(env.SOCIAL_INSTAGRAM_MAX_POSTS_PER_DAY, 3, 1, 12),
    maxPostsPerDayTiktok: parseIntEnv(env.SOCIAL_TIKTOK_MAX_POSTS_PER_DAY, 2, 1, 12),
    maxPostsPerDayInstagramReels: parseIntEnv(env.SOCIAL_INSTAGRAM_REELS_MAX_POSTS_PER_DAY, 2, 1, 12),
    maxPostsPerDayYoutube: parseIntEnv(env.SOCIAL_YOUTUBE_MAX_POSTS_PER_DAY, 2, 1, 12),
    instagramHighImpactOnly: parseBool(env.SOCIAL_INSTAGRAM_HIGH_IMPACT_ONLY, true),
    instagramMinImpactScore: parseIntEnv(env.SOCIAL_INSTAGRAM_MIN_IMPACT_SCORE, 2, 1, 5),
    publishTimeZone: env.SOCIAL_PUBLISH_TIMEZONE?.trim() || "America/Mexico_City",
    assetsDir: env.SOCIAL_ASSETS_DIR?.trim() || ".social/assets",
    exportsDir: env.SOCIAL_EXPORTS_DIR?.trim() || ".social/exports",
    siteUrl: (env.NEXT_PUBLIC_SITE_URL?.trim() || "https://www.veraz.app").replace(/\/$/, ""),
  };
}
