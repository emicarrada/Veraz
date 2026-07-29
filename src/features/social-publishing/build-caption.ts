import {
  PLATFORM_CHAR_LIMITS,
  resolveHashtagsForCategory,
  resolveHashtagsForTikTok,
  type SocialCaptionOptions,
} from "@/features/social-publishing/caption-options";
import type { SocialArticleCandidate, SocialPlatform } from "@/features/social-publishing/types";

function trimToLength(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

function sourceLine(candidate: SocialArticleCandidate, locale: SocialCaptionOptions["locale"]): string {
  return locale === "en"
    ? `Source: ${candidate.sourceAttribution}`
    : `Fuente: ${candidate.sourceAttribution}`;
}

function buildBaseBody(candidate: SocialArticleCandidate, includeExcerpt: boolean): string {
  const parts = [candidate.title];
  if (includeExcerpt && candidate.excerpt.trim()) {
    parts.push("", trimToLength(candidate.excerpt.trim(), 280));
  }
  parts.push("", `🔗 ${candidate.verazArticleUrl}`, "", sourceLine(candidate, candidate.locale));
  return parts.join("\n");
}

function buildForX(candidate: SocialArticleCandidate): string {
  const link = candidate.verazArticleUrl;
  const source = sourceLine(candidate, candidate.locale);
  const title = candidate.title;
  const limit = PLATFORM_CHAR_LIMITS.x;

  const withSource = `${title}\n\n${link}\n\n${source}`;
  if (withSource.length <= limit) return withSource;

  const withLink = `${title}\n\n${link}`;
  if (withLink.length <= limit) return withLink;

  const compact = `${title}\n${link}`;
  if (compact.length <= limit) return compact;

  return title.length <= limit ? title : trimToLength(title, limit);
}

function buildForInstagram(
  candidate: SocialArticleCandidate,
  options: SocialCaptionOptions,
): string {
  const hashtags = resolveHashtagsForCategory(
    candidate.categorySlug,
    options.locale,
    options.globalHashtags,
  );
  const body = buildBaseBody(candidate, options.includeExcerpt);
  return `${body}\n\n${hashtags.join(" ")}`.trim();
}

function buildForTikTok(candidate: SocialArticleCandidate, options: SocialCaptionOptions): string {
  const locale = candidate.locale;
  const hook = trimToLength(candidate.title.replace(/\s+/g, " ").trim(), 150);

  const cta =
    locale === "en"
      ? "Read the full story on Veraz:"
      : "Noticia completa en Veraz:";

  const hashtags = resolveHashtagsForTikTok(
    candidate.categorySlug,
    locale,
    options.globalHashtags,
  );

  const lines = [hook];

  if (options.includeExcerpt && candidate.excerpt.trim()) {
    lines.push("", trimToLength(candidate.excerpt.trim(), 140));
  }

  lines.push(
    "",
    cta,
    candidate.verazArticleUrl,
    "",
    sourceLine(candidate, locale),
    "",
    hashtags.join(" "),
  );

  return lines.join("\n").trim();
}

function buildForInstagramReels(
  candidate: SocialArticleCandidate,
  options: SocialCaptionOptions,
): string {
  return buildForInstagram(candidate, options);
}

function buildForYoutube(candidate: SocialArticleCandidate, options: SocialCaptionOptions): string {
  const hashtags = resolveHashtagsForCategory(
    candidate.categorySlug,
    options.locale,
    [...options.globalHashtags, "#Shorts", "#Veraz"],
  );
  const body = buildBaseBody(candidate, options.includeExcerpt);
  return `${body}\n\n${hashtags.join(" ")}`.trim();
}

export function buildYoutubeTitle(candidate: SocialArticleCandidate): string {
  const base = candidate.title.trim();
  if (base.length <= 95) return base;
  return `${base.slice(0, 94).trimEnd()}…`;
}

function buildForPlatform(
  platform: SocialPlatform,
  candidate: SocialArticleCandidate,
  options: SocialCaptionOptions,
): string {
  switch (platform) {
    case "x":
      return buildForX(candidate);
    case "instagram":
      return buildForInstagram(candidate, options);
    case "tiktok":
      return buildForTikTok(candidate, options);
    case "instagram_reels":
      return buildForInstagramReels(candidate, options);
    case "youtube":
      return buildForYoutube(candidate, options);
    default:
      return buildBaseBody(candidate, options.includeExcerpt);
  }
}

/** @deprecated Use buildSocialCaptions */
export function buildSocialCaption(candidate: SocialArticleCandidate): string {
  return buildBaseBody(candidate, false);
}

export function buildSocialCaptions(
  candidate: SocialArticleCandidate,
  options: SocialCaptionOptions,
): Record<SocialPlatform, string> {
  const result = {} as Record<SocialPlatform, string>;
  for (const platform of options.platforms) {
    const caption = buildForPlatform(platform, candidate, options);
    const limit = PLATFORM_CHAR_LIMITS[platform];
    result[platform] =
      platform === "x" || platform === "instagram" || platform === "instagram_reels"
        ? caption.length <= limit
          ? caption
          : trimToLength(caption, limit)
        : trimToLength(caption, limit);
  }
  return result;
}
