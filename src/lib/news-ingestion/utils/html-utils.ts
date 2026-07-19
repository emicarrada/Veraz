const NAMED_HTML_ENTITIES: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  aacute: "á",
  eacute: "é",
  iacute: "í",
  oacute: "ó",
  uacute: "ú",
  Aacute: "Á",
  Eacute: "É",
  Iacute: "Í",
  Oacute: "Ó",
  Uacute: "Ú",
  ntilde: "ñ",
  Ntilde: "Ñ",
  uuml: "ü",
  Uuml: "Ü",
  iuml: "ï",
  Iuml: "Ï",
  ouml: "ö",
  Ouml: "Ö",
  auml: "ä",
  Auml: "Ä",
  ccedil: "ç",
  Ccedil: "Ç",
  euro: "€",
  rsquo: "'",
  lsquo: "'",
  rdquo: '"',
  ldquo: '"',
  hellip: "…",
  mdash: "—",
  ndash: "–",
};

/**
 * Decodes HTML entities (numeric and common named) to UTF-8 text.
 */
export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => {
      const code = Number.parseInt(hex, 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : _;
    })
    .replace(/&#(\d+);/g, (_, dec: string) => {
      const code = Number.parseInt(dec, 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : _;
    })
    .replace(/&([a-zA-Z]+);/g, (match, name: string) => NAMED_HTML_ENTITIES[name] ?? match);
}

/**
 * Strips HTML tags and collapses whitespace for RSS excerpts.
 */
export function stripHtml(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<!\[CDATA\[([\s\S]*?)]]>/gi, "$1")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

/**
 * Normalizes a remote image URL from RSS/HTML sources.
 */
export function normalizeImageUrl(raw: string | undefined): string | undefined {
  if (!raw?.trim()) return undefined;

  let url = decodeHtmlEntities(raw.trim()).replace(/\s+/g, "");
  if (url.startsWith("//")) {
    url = `https:${url}`;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return undefined;
    }
    return parsed.toString();
  } catch {
    return undefined;
  }
}

/**
 * Extracts the first image URL from HTML (img src or srcset first entry).
 */
export function extractFirstImageUrl(html: string | undefined): string | undefined {
  if (!html?.trim()) return undefined;

  const decoded = html.replace(/<!\[CDATA\[([\s\S]*?)]]>/gi, "$1");

  const srcMatch = decoded.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  if (srcMatch?.[1]?.trim()) {
    return normalizeImageUrl(srcMatch[1].trim());
  }

  const srcsetMatch = decoded.match(/<img[^>]+srcset=["']([^"']+)["'][^>]*>/i);
  if (srcsetMatch?.[1]?.trim()) {
    const firstCandidate = srcsetMatch[1].split(",")[0]?.trim().split(/\s+/)[0];
    if (firstCandidate) return normalizeImageUrl(firstCandidate);
  }

  return undefined;
}

/**
 * Truncates plain text at word boundary with ellipsis.
 */
export function truncateText(text: string, maxLength: number): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;

  const slice = normalized.slice(0, maxLength);
  const lastSpace = slice.lastIndexOf(" ");
  const base = lastSpace > maxLength * 0.6 ? slice.slice(0, lastSpace) : slice;
  return `${base.trim()}…`;
}
