import {
  decodeHtmlEntities,
  truncateText,
} from "@/lib/news-ingestion/utils/html-utils";

import { FEED_SUMMARY_MAX_LENGTH } from "@/features/news/constants";

/**
 * Cleans text for UI display (handles legacy DB rows with undecoded entities).
 */
export function formatDisplayText(text: string): string {
  return decodeHtmlEntities(text).replace(/\s+/g, " ").trim();
}

export function formatFeedSummary(text: string): string {
  return truncateText(formatDisplayText(text), FEED_SUMMARY_MAX_LENGTH);
}
