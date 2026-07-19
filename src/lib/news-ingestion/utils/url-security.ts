/**
 * URL safety checks for ingestion (anti-SSRF, scheme policy).
 */

const PRIVATE_IPV4_RANGES = [
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
];

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata.google",
]);

export type PublicHttpUrlOptions = {
  allowHttp?: boolean;
};

/**
 * Returns true when URL is a public http(s) endpoint safe for ingestion references.
 */
export function isPublicHttpUrl(
  raw: string,
  options: PublicHttpUrlOptions = {},
): boolean {
  const allowHttp = options.allowHttp ?? true;

  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    return false;
  }

  if (parsed.protocol === "https:") {
    // allowed
  } else if (parsed.protocol === "http:" && allowHttp) {
    // allowed
  } else {
    return false;
  }

  const hostname = parsed.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return false;
  }

  if (hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    return false;
  }

  if (hostname === "::1" || hostname.includes(":")) {
    // IPv6 — block loopback and unique local
    if (
      hostname === "::1" ||
      hostname.startsWith("fc") ||
      hostname.startsWith("fd") ||
      hostname.startsWith("fe80")
    ) {
      return false;
    }
  }

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    return !PRIVATE_IPV4_RANGES.some((pattern) => pattern.test(hostname));
  }

  return true;
}

export const INGESTION_FIELD_LIMITS = {
  titleMax: 500,
  excerptMax: 2_000,
  bodyExcerptMax: 20_000,
  maxHtmlTagCount: 200,
} as const;

/** Counts HTML-like tags remaining after strip (rough heuristic). */
export function countHtmlTags(text: string): number {
  const matches = text.match(/<[^>]+>/g);
  return matches?.length ?? 0;
}
