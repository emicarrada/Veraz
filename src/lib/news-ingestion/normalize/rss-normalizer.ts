import { NormalizationFailedError } from "@/lib/news-ingestion/errors";
import { IngestionEngineError } from "@/lib/news-ingestion/errors/base";
import type { Normalizer } from "@/lib/news-ingestion/normalize/normalizer";
import type { PipelineContext } from "@/lib/news-ingestion/pipeline/pipeline-stage";
import type {
  NormalizedArticle,
  ProviderPayload,
} from "@/lib/news-ingestion/types/article";
import type { IngestionResult } from "@/lib/news-ingestion/types/results";
import type { RssProviderRaw } from "@/lib/news-ingestion/providers/rss/rss-types";
import { normalizeImageUrl, stripHtml } from "@/lib/news-ingestion/utils/html-utils";
import { ingestionFail, ingestionOk } from "@/lib/news-ingestion/utils/ingestion-result";
import { urlFingerprint } from "@/lib/news-ingestion/utils/url-fingerprint";

const DEFAULT_LANGUAGE = "es";
const EXCERPT_MAX_LENGTH = 320;
const BODY_EXCERPT_MAX_LENGTH = 1_200;
const BODY_EXCERPT_MIN_DESCRIPTION_LENGTH = 200;

function plainTextFromHtml(html: string | undefined): string | undefined {
  if (!html?.trim()) return undefined;
  const text = stripHtml(html).trim();
  return text.length > 0 ? text : undefined;
}

function buildExcerpt(description?: string, content?: string, title?: string): string {
  const descriptionText = plainTextFromHtml(description);
  const contentText = plainTextFromHtml(content);
  const primary = [descriptionText, contentText].filter(
    (value): value is string => Boolean(value),
  );

  if (primary.length > 0) {
    const longest = primary.reduce(
      (best, current) => (current.length > best.length ? current : best),
      primary[0]!,
    );
    return longest.slice(0, EXCERPT_MAX_LENGTH);
  }

  return (title?.trim() ?? "").slice(0, EXCERPT_MAX_LENGTH);
}

function buildBodyExcerpt(description?: string, content?: string): string | undefined {
  const contentText = plainTextFromHtml(content);
  if (contentText) {
    return contentText.slice(0, BODY_EXCERPT_MAX_LENGTH);
  }

  const descriptionText = plainTextFromHtml(description);
  if (
    descriptionText &&
    descriptionText.length >= BODY_EXCERPT_MIN_DESCRIPTION_LENGTH
  ) {
    return descriptionText.slice(0, BODY_EXCERPT_MAX_LENGTH);
  }

  return undefined;
}

function isRssProviderRaw(raw: unknown): raw is RssProviderRaw {
  return (
    typeof raw === "object" &&
    raw !== null &&
    (raw as RssProviderRaw).kind === "rss-item" &&
    typeof (raw as RssProviderRaw).item?.link === "string"
  );
}

/**
 * Maps RSS ProviderPayload → NormalizedArticle.
 */
export class RssNormalizer implements Normalizer {
  async normalize(
    payload: ProviderPayload,
    _context: PipelineContext,
  ): Promise<IngestionResult<NormalizedArticle>> {
    try {
      if (!isRssProviderRaw(payload.raw)) {
        return ingestionFail(
          new NormalizationFailedError(
            "RSS normalizer received invalid payload raw shape.",
            { providerId: payload.providerId },
          ),
        );
      }

      const { item, feed } = payload.raw;
      const excerpt = buildExcerpt(item.description, item.content, item.title);
      const bodyExcerpt = buildBodyExcerpt(item.description, item.content);

      const languageCode = feed.language?.split("-")[0] ?? DEFAULT_LANGUAGE;
      const publishedAt =
        item.publishedAt ?? payload.fetchedAt ?? new Date().toISOString();

      const normalized: NormalizedArticle = {
        providerId: payload.providerId,
        providerItemId: payload.providerItemId,
        sourceSlug: payload.sourceSlug,
        canonicalUrl: item.link,
        urlFingerprint: urlFingerprint(item.link),
        title: stripHtml(item.title),
        excerpt,
        publishedAt,
        languageCode,
        contentFormat: item.heroImageUrl ? "mixed" : "text",
        paywallOriginal: false,
        references: [
          {
            url: item.link,
            title: item.title,
            kind: "original",
          },
        ],
        ...(bodyExcerpt ? { bodyExcerpt } : {}),
        ...(item.author ? { byline: item.author } : {}),
        ...(item.heroImageUrl
          ? { heroImageUrl: normalizeImageUrl(item.heroImageUrl) }
          : {}),
        ...(item.categories?.length ? { categories: [...item.categories] } : {}),
        rawMetadata: {
          feedTitle: feed.title,
          feedFormat: feed.format,
        },
      };

      return ingestionOk(normalized);
    } catch (error) {
      if (error instanceof IngestionEngineError) {
        return ingestionFail(error);
      }
      return ingestionFail(
        new NormalizationFailedError(
          error instanceof Error ? error.message : "RSS normalization failed.",
          { providerId: payload.providerId, cause: error },
        ),
      );
    }
  }
}
