import { createHash } from "node:crypto";

/**
 * Normalizes a URL for dedupe fingerprinting (tracking params stripped).
 */
export function normalizeUrlForFingerprint(url: string): string {
  try {
    const parsed = new URL(url.trim());
    parsed.hash = "";

    const trackingParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "fbclid",
      "gclid",
    ];

    for (const param of trackingParams) {
      parsed.searchParams.delete(param);
    }

    parsed.search = parsed.searchParams.toString()
      ? `?${parsed.searchParams.toString()}`
      : "";

    return parsed.toString();
  } catch {
    return url.trim();
  }
}

export function urlFingerprint(url: string): string {
  return createHash("sha256")
    .update(normalizeUrlForFingerprint(url))
    .digest("hex");
}
