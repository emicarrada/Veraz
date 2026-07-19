import {
  ProviderNotFoundError,
  ProviderParseFailureError,
  ProviderTimeoutError,
  ProviderUnavailableError,
} from "@/lib/news-ingestion/errors";
import type { NewsProviderId } from "@/lib/news-ingestion/types/provider-id";

const RSS_PROVIDER_ID: NewsProviderId = "rss";

export type RssFeedFetchResult = {
  xml: string;
  contentType?: string;
  fetchedAt: string;
};

export type RssFeedFetcherOptions = {
  timeoutMs?: number;
  maxBytes?: number;
  fetchImpl?: typeof fetch;
};

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_MAX_BYTES = 2 * 1024 * 1024;

const ALLOWED_CONTENT_TYPES = [
  "application/rss+xml",
  "application/atom+xml",
  "application/xml",
  "text/xml",
  "application/octet-stream",
];

function isAllowedContentType(contentType: string | null): boolean {
  if (!contentType) return true;

  const normalized = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
  if (!normalized) return true;

  return ALLOWED_CONTENT_TYPES.some(
    (allowed) => normalized === allowed || normalized.endsWith("+xml"),
  );
}

async function readResponseWithLimit(
  response: Response,
  maxBytes: number,
): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) {
    const text = await response.text();
    if (text.length > maxBytes) {
      throw new ProviderParseFailureError(
        RSS_PROVIDER_ID,
        `Feed response exceeds ${maxBytes} bytes.`,
      );
    }
    return text;
  }

  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;

    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new ProviderParseFailureError(
        RSS_PROVIDER_ID,
        `Feed response exceeds ${maxBytes} bytes.`,
      );
    }

    chunks.push(value);
  }

  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder("utf-8", { fatal: false }).decode(merged);
}

/**
 * Downloads RSS/Atom XML from a public feed URL.
 * Responsible only for HTTP fetch — no parsing.
 */
export class RssFeedFetcher {
  private readonly timeoutMs: number;
  private readonly maxBytes: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: RssFeedFetcherOptions = {}) {
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async fetch(feedUrl: string): Promise<RssFeedFetchResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchImpl(feedUrl, {
        method: "GET",
        headers: {
          Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
          "User-Agent": "Veraz-RSS-Ingestion/1.0",
        },
        signal: controller.signal,
      });

      if (response.status === 404) {
        throw new ProviderNotFoundError(
          RSS_PROVIDER_ID,
          `Feed not found: ${feedUrl}`,
        );
      }

      if (!response.ok) {
        throw new ProviderUnavailableError(
          RSS_PROVIDER_ID,
          `Feed request failed with status ${response.status}.`,
        );
      }

      const contentType = response.headers.get("content-type");
      if (!isAllowedContentType(contentType)) {
        throw new ProviderParseFailureError(
          RSS_PROVIDER_ID,
          `Unsupported feed content type: ${contentType ?? "unknown"}.`,
        );
      }

      const xml = await readResponseWithLimit(response, this.maxBytes);
      if (!xml.trim()) {
        throw new ProviderParseFailureError(
          RSS_PROVIDER_ID,
          "Feed response body is empty.",
        );
      }

      return {
        xml,
        contentType: contentType ?? undefined,
        fetchedAt: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof ProviderNotFoundError) throw error;
      if (error instanceof ProviderUnavailableError) throw error;
      if (error instanceof ProviderParseFailureError) throw error;

      if (error instanceof Error && error.name === "AbortError") {
        throw new ProviderTimeoutError(
          RSS_PROVIDER_ID,
          `Feed request timed out after ${this.timeoutMs}ms.`,
        );
      }

      throw new ProviderUnavailableError(
        RSS_PROVIDER_ID,
        error instanceof Error ? error.message : "Feed request failed.",
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}
