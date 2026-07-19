import { ProviderParseFailureError } from "@/lib/news-ingestion/errors";
import type {
  ProviderPayload,
} from "@/lib/news-ingestion/types/article";
import type { IngestionInstant } from "@/lib/news-ingestion/types/primitives";
import type {
  RssFeedDocument,
  RssFeedMetadata,
  RssRawItem,
} from "@/lib/news-ingestion/providers/rss/rss-types";
import { extractFirstImageUrl, normalizeImageUrl, stripHtml } from "@/lib/news-ingestion/utils/html-utils";
import { urlFingerprint } from "@/lib/news-ingestion/utils/url-fingerprint";

const RSS_PROVIDER_ID = "rss" as const;
const MAX_ITEMS_PER_FEED = 100;

export type RssParseContext = {
  sourceSlug: string;
  feedUrl: string;
  fetchedAt: IngestionInstant;
};

function decodeEntities(text: string): string {
  return stripHtml(text);
}

/** Raw inner HTML for a tag (CDATA unwrapped; tags preserved). */
function extractTagHtml(block: string, tagName: string): string | undefined {
  const cdataPattern = new RegExp(
    `<${tagName}[^>]*><!\\[CDATA\\[([\\s\\S]*?)]]><\\/${tagName}>`,
    "i",
  );
  const cdataMatch = block.match(cdataPattern);
  if (cdataMatch?.[1] !== undefined) {
    return cdataMatch[1].trim();
  }

  const pattern = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i");
  const match = block.match(pattern);
  if (!match?.[1]) return undefined;
  return match[1].trim();
}

function extractTagValue(block: string, tagName: string): string | undefined {
  const cdataPattern = new RegExp(
    `<${tagName}[^>]*><!\\[CDATA\\[([\\s\\S]*?)]]><\\/${tagName}>`,
    "i",
  );
  const cdataMatch = block.match(cdataPattern);
  if (cdataMatch?.[1] !== undefined) {
    return decodeEntities(cdataMatch[1].trim());
  }

  const pattern = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i");
  const match = block.match(pattern);
  if (!match?.[1]) return undefined;
  return decodeEntities(match[1].trim());
}

function extractLinkHref(block: string): string | undefined {
  const linkMatch = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*\/?>/i);
  return linkMatch?.[1]?.trim();
}

function extractEnclosureUrl(block: string): string | undefined {
  const enclosureMatch = block.match(
    /<enclosure[^>]+url=["']([^"']+)["'][^>]*\/?>/i,
  );
  return normalizeImageUrl(enclosureMatch?.[1]?.trim());
}

function extractMediaTagUrl(block: string, tagName: string): string | undefined {
  const pattern = new RegExp(`<${tagName}\\b[^>]*\\/?>`, "gi");
  let match = pattern.exec(block);

  while (match) {
    const tag = match[0];
    const urlMatch = tag.match(/\burl=["']([^"']+)["']/i);
    const typeMatch = tag.match(/\btype=["']([^"']+)["']/i);
    const url = urlMatch?.[1]?.trim();

    if (!url) {
      match = pattern.exec(block);
      continue;
    }

    if (!typeMatch || typeMatch[1]?.startsWith("image/")) {
      return normalizeImageUrl(url);
    }

    match = pattern.exec(block);
  }

  return undefined;
}

function extractHeroImageUrl(
  block: string,
  descriptionHtml?: string,
  contentHtml?: string,
): string | undefined {
  return (
    extractEnclosureUrl(block) ??
    extractMediaTagUrl(block, "media:thumbnail") ??
    extractMediaTagUrl(block, "media:content") ??
    extractFirstImageUrl(contentHtml) ??
    extractFirstImageUrl(descriptionHtml)
  );
}

function extractCategories(block: string): string[] {
  const categories: string[] = [];
  const pattern = /<category[^>]*>([\s\S]*?)<\/category>/gi;
  let match = pattern.exec(block);
  while (match) {
    const value = match[1]?.trim();
    if (value) categories.push(decodeEntities(value));
    match = pattern.exec(block);
  }
  return categories;
}

function parseDateToIso(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const parsed = Date.parse(raw);
  if (Number.isNaN(parsed)) return undefined;
  return new Date(parsed).toISOString();
}

function detectFormat(xml: string): "rss" | "atom" | null {
  if (/<rss[\s>]/i.test(xml) || /<channel[\s>]/i.test(xml)) return "rss";
  if (/<feed[\s>]/i.test(xml) || /<entry[\s>]/i.test(xml)) return "atom";
  return null;
}

function parseRssItem(block: string): RssRawItem | null {
  const title = extractTagValue(block, "title");
  const link = extractTagValue(block, "link");
  if (!title || !link) return null;

  const guid = extractTagValue(block, "guid") ?? link;
  const descriptionHtml = extractTagHtml(block, "description") ?? extractTagHtml(block, "summary");
  const contentHtml = extractTagHtml(block, "content:encoded");
  const description = descriptionHtml ? decodeEntities(descriptionHtml) : undefined;
  const content = contentHtml ? decodeEntities(contentHtml) : undefined;
  const pubDate =
    parseDateToIso(extractTagValue(block, "pubDate")) ??
    parseDateToIso(extractTagValue(block, "dc:date"));

  return {
    id: guid,
    title,
    link,
    description,
    content,
    publishedAt: pubDate,
    author: extractTagValue(block, "author") ?? extractTagValue(block, "dc:creator"),
    categories: extractCategories(block),
    heroImageUrl: extractHeroImageUrl(block, descriptionHtml, contentHtml),
  };
}

function parseAtomEntry(block: string): RssRawItem | null {
  const title = extractTagValue(block, "title");
  const link = extractLinkHref(block) ?? extractTagValue(block, "link");
  if (!title || !link) return null;

  const id = extractTagValue(block, "id") ?? link;
  const summaryHtml = extractTagHtml(block, "summary");
  const contentHtml = extractTagHtml(block, "content");
  const summary = summaryHtml ? decodeEntities(summaryHtml) : undefined;
  const content = contentHtml ? decodeEntities(contentHtml) : undefined;
  const publishedAt =
    parseDateToIso(extractTagValue(block, "published")) ??
    parseDateToIso(extractTagValue(block, "updated"));

  return {
    id,
    title,
    link,
    description: summary,
    content,
    publishedAt,
    author: extractTagValue(block, "name"),
    categories: extractCategories(block),
    heroImageUrl: extractHeroImageUrl(block, summaryHtml, contentHtml),
  };
}

function extractBlocks(xml: string, tagName: string): string[] {
  const pattern = new RegExp(`<${tagName}\\b[\\s\\S]*?<\\/${tagName}>`, "gi");
  return xml.match(pattern) ?? [];
}

/**
 * Parses RSS 2.0 or Atom XML into a structured feed document.
 */
export class RssXmlParser {
  parseFeed(xml: string): RssFeedDocument {
    const trimmed = xml.trim();
    if (!trimmed) {
      throw new ProviderParseFailureError(RSS_PROVIDER_ID, "Feed XML is empty.");
    }

    const format = detectFormat(trimmed);
    if (!format) {
      throw new ProviderParseFailureError(
        RSS_PROVIDER_ID,
        "Unsupported or invalid feed format.",
      );
    }

    const metadata: RssFeedMetadata = { format };

    if (format === "rss") {
      metadata.title = extractTagValue(trimmed, "title");
      metadata.link = extractTagValue(trimmed, "link");
      metadata.language = extractTagValue(trimmed, "language");

      const items = extractBlocks(trimmed, "item")
        .slice(0, MAX_ITEMS_PER_FEED)
        .map(parseRssItem)
        .filter((item): item is RssRawItem => item !== null);

      return { metadata, items };
    }

    metadata.title = extractTagValue(trimmed, "title");
    metadata.link = extractLinkHref(trimmed);
    metadata.language = extractTagValue(trimmed, "language");

    const items = extractBlocks(trimmed, "entry")
      .slice(0, MAX_ITEMS_PER_FEED)
      .map(parseAtomEntry)
      .filter((item): item is RssRawItem => item !== null);

    return { metadata, items };
  }

  /**
   * Converts parsed feed items into ProviderPayload records.
   */
  buildPayloads(
    document: RssFeedDocument,
    context: RssParseContext,
  ): ProviderPayload[] {
    return document.items.map((item) => this.buildItemPayload(item, document.metadata, context));
  }

  buildItemPayload(
    item: RssRawItem,
    feed: RssFeedMetadata,
    context: RssParseContext,
  ): ProviderPayload {
    const providerItemId = item.id || urlFingerprint(item.link);

    return {
      providerId: RSS_PROVIDER_ID,
      providerItemId,
      sourceSlug: context.sourceSlug,
      fetchedAt: context.fetchedAt,
      contentType: "application/xml",
      raw: {
        kind: "rss-item",
        item,
        feed,
        feedUrl: context.feedUrl,
      },
    };
  }

  /**
   * Parses XML and returns ProviderPayload[] — XML → ProviderPayload boundary.
   */
  parseToPayloads(xml: string, context: RssParseContext): ProviderPayload[] {
    const document = this.parseFeed(xml);
    return this.buildPayloads(document, context);
  }
}
