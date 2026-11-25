import type { Locale } from "@/i18n/routing";

export type AITranslateInput = {
  locale: Locale;
  sourceLocale: string;
  title: string;
  excerpt: string;
  bodyExcerpt?: string;
};

export type AITranslateResult = {
  title: string;
  excerpt: string;
  bodyExcerpt?: string;
};

const REQUEST_TIMEOUT_MS = 8000;
const MAX_CHARS = 450;
const GOOGLE_COOLDOWN_MS = 10 * 60 * 1000;

let googleBlockedUntil = 0;

export function resetTranslateCooldown(): void {
  googleBlockedUntil = 0;
}

function languageCode(code: string): string {
  return code.trim().toLowerCase().split("-")[0] ?? code;
}

function clip(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length <= MAX_CHARS) return trimmed;
  return trimmed.slice(0, MAX_CHARS);
}

function readGoogle(payload: unknown): string | null {
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) return null;
  const text = payload[0]
    .map((chunk) => (Array.isArray(chunk) && typeof chunk[0] === "string" ? chunk[0] : ""))
    .join("")
    .trim();
  return text.length > 0 ? text : null;
}

async function translateWithGoogle(
  text: string,
  sourceLocale: string,
  targetLocale: string,
): Promise<string | null | "blocked"> {
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", sourceLocale);
  url.searchParams.set("tl", targetLocale);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text);

  const response = await fetch(url, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: { Accept: "application/json", "User-Agent": "Veraz/1.0" },
  });
  if (response.status === 429) return "blocked";
  if (!response.ok) return null;
  return readGoogle(await response.json());
}

async function translateWithMyMemory(
  text: string,
  sourceLocale: string,
  targetLocale: string,
): Promise<string | null> {
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", text);
  url.searchParams.set("langpair", `${sourceLocale}|${targetLocale}`);

  const response = await fetch(url, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: { Accept: "application/json", "User-Agent": "Veraz/1.0" },
  });
  if (!response.ok) return null;

  const payload = (await response.json()) as {
    responseData?: { translatedText?: string };
    quotaFinished?: boolean;
  };
  const translated = payload.responseData?.translatedText?.trim() ?? "";
  if (!translated || payload.quotaFinished || translated.includes("MYMEMORY WARNING")) {
    return null;
  }
  return translated;
}

async function translateText(
  text: string,
  sourceLocale: string,
  targetLocale: string,
): Promise<string | null> {
  const source = clip(text);
  if (!source) return "";

  try {
    if (Date.now() >= googleBlockedUntil) {
      const google = await translateWithGoogle(source, sourceLocale, targetLocale);
      if (google === "blocked") {
        googleBlockedUntil = Date.now() + GOOGLE_COOLDOWN_MS;
      } else if (google) {
        return google;
      }
    }

    return await translateWithMyMemory(source, sourceLocale, targetLocale);
  } catch {
    return null;
  }
}

/**
 * Translates title and excerpt for display.
 * Fail-open: returns null when translation does not respond, so the original stays visible.
 * Does not depend on AI_MODE. The stored article is unchanged.
 */
export async function translateArticleContent(
  input: AITranslateInput,
): Promise<AITranslateResult | null> {
  const sourceLocale = languageCode(input.sourceLocale);
  const targetLocale = languageCode(input.locale);
  if (!sourceLocale || sourceLocale === targetLocale) return null;

  const [title, excerpt, bodyExcerpt] = await Promise.all([
    translateText(input.title, sourceLocale, targetLocale),
    translateText(input.excerpt, sourceLocale, targetLocale),
    input.bodyExcerpt
      ? translateText(input.bodyExcerpt, sourceLocale, targetLocale)
      : Promise.resolve(undefined),
  ]);

  if (!title) return null;

  return {
    title,
    excerpt: excerpt ?? input.excerpt,
    ...(bodyExcerpt ? { bodyExcerpt } : {}),
  };
}

export async function mapWithLimit<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const index = next;
      next += 1;
      const item = items[index];
      if (item === undefined) return;
      results[index] = await fn(item);
    }
  }

  const workers = Math.min(Math.max(limit, 1), items.length);
  await Promise.all(Array.from({ length: workers }, () => worker()));
  return results;
}
