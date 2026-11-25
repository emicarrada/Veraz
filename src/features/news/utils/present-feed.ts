import type { ArticleFeedItem } from "@/features/news/types/feed";
import { sortFeedItemsByPublishedAt } from "@/features/news/utils/sort-feed-items";

/** How far apart two headlines can be and still share a card. */
const CLUSTER_WINDOW_MS = 36 * 60 * 60 * 1000;
const MAX_CLUSTER_SIZE = 5;

const STOP_WORDS = new Set([
  "el", "la", "los", "las", "un", "una", "unos", "unas", "de", "del", "al", "y", "o", "en",
  "con", "por", "para", "que", "se", "su", "sus", "es", "son", "como", "mas", "tras", "sobre",
  "entre", "desde", "hasta", "the", "and", "for", "with", "from", "that", "this", "after",
  "before", "into", "over", "amid", "than", "then", "them", "they", "have", "been", "will",
  "would", "could", "about", "what", "when", "where", "which", "while", "just", "also",
  "says", "said", "news", "notas", "nota",
]);

/** Words that show up in many unrelated headlines and must not glue them together. */
const GENERIC_WORDS = new Set([
  "gobierno", "presidente", "presidenta", "nacional", "internacional", "mundial", "partido",
  "equipo", "final", "mercado", "mercados", "precio", "precios", "empresa", "millones",
  "nuevo", "nueva", "nuevos", "nuevas", "segun", "tiene", "tienen", "hace", "sera", "estan",
  "puede", "pueden", "dice", "dijo", "anuncia", "anuncian", "pais", "mundo", "report",
  "reports", "year", "years", "week", "today", "their", "more", "casa", "blanca",
]);

export type ArticleCardVariant = "lead" | "media" | "compact";

export type FeedArticleUnit = {
  kind: "article";
  item: ArticleFeedItem;
  variant: ArticleCardVariant;
};

export type FeedClusterUnit = {
  kind: "cluster";
  items: ArticleFeedItem[];
  variant: "lead" | "media";
};

export type FeedPresentationUnit = FeedArticleUnit | FeedClusterUnit;

export type FeedCheckpoint = {
  itemId: string;
  publishedAt: string;
};

export type FeedMarkerRow = {
  kind: "marker";
  itemId: string;
  publishedAt: string;
};

export type FeedRow = FeedPresentationUnit | FeedMarkerRow;

function fold(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

function significantTokens(title: string): string[] {
  const tokens = fold(title)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 4 && !STOP_WORDS.has(token) && !GENERIC_WORDS.has(token));

  return [...new Set(tokens)];
}

function overlap(left: readonly string[], right: readonly string[]): { shared: number; jaccard: number } {
  const rightSet = new Set(right);
  let shared = 0;
  for (const token of left) {
    if (rightSet.has(token)) shared += 1;
  }
  const union = new Set([...left, ...right]).size;
  return { shared, jaccard: union === 0 ? 0 : shared / union };
}

/**
 * Reading aid only: similar headlines from different outlets in a short window.
 * It does not assert they describe the same event, and it never rewrites a title.
 */
function canGroup(
  seed: ArticleFeedItem,
  other: ArticleFeedItem,
  seedTokens: readonly string[],
  otherTokens: readonly string[],
): boolean {
  if (other.sourceSlug === seed.sourceSlug) return false;

  const seedTime = Date.parse(seed.publishedAt);
  const otherTime = Date.parse(other.publishedAt);
  if (!Number.isFinite(seedTime) || !Number.isFinite(otherTime)) return false;
  if (Math.abs(seedTime - otherTime) > CLUSTER_WINDOW_MS) return false;

  const { shared, jaccard } = overlap(seedTokens, otherTokens);
  const strong = shared >= 3 && jaccard >= 0.34;
  const close = shared >= 2 && jaccard >= 0.5;
  if (!strong && !close) return false;
  if (!strong && seed.categorySlug !== other.categorySlug) return false;
  return true;
}

function groupFeedItems(
  items: readonly ArticleFeedItem[],
  keepOrder = false,
): Array<{ kind: "article"; item: ArticleFeedItem } | { kind: "cluster"; items: ArticleFeedItem[] }> {
  const sorted = keepOrder ? [...items] : sortFeedItemsByPublishedAt(items);
  const tokensById = new Map(sorted.map((item) => [item.id, significantTokens(item.title)]));
  const used = new Set<string>();
  const groups: Array<
    { kind: "article"; item: ArticleFeedItem } | { kind: "cluster"; items: ArticleFeedItem[] }
  > = [];

  for (const item of sorted) {
    if (used.has(item.id)) continue;

    const seedTokens = tokensById.get(item.id) ?? [];
    const group = [item];
    const sources = new Set([item.sourceSlug]);
    used.add(item.id);

    for (const other of sorted) {
      if (group.length >= MAX_CLUSTER_SIZE) break;
      if (used.has(other.id) || sources.has(other.sourceSlug)) continue;
      if (!canGroup(item, other, seedTokens, tokensById.get(other.id) ?? [])) continue;
      group.push(other);
      sources.add(other.sourceSlug);
      used.add(other.id);
    }

    if (group.length >= 2) {
      groups.push({ kind: "cluster", items: group });
    } else {
      groups.push({ kind: "article", item });
    }
  }

  return groups;
}

function withVariants(
  groups: ReadonlyArray<
    { kind: "article"; item: ArticleFeedItem } | { kind: "cluster"; items: ArticleFeedItem[] }
  >,
): FeedPresentationUnit[] {
  return groups.map((group, index) => {
    if (group.kind === "cluster") {
      return { kind: "cluster", items: group.items, variant: index === 0 ? "lead" : "media" };
    }

    const variant: ArticleCardVariant =
      index === 0 ? "lead" : index % 2 === 1 ? "media" : "compact";
    return { kind: "article", item: group.item, variant };
  });
}

export function buildFeedRows(
  items: readonly ArticleFeedItem[],
  checkpoints: readonly FeedCheckpoint[] = [],
  options?: { keepOrder?: boolean },
): FeedRow[] {
  const units = withVariants(groupFeedItems(items, options?.keepOrder ?? false));
  if (checkpoints.length === 0) return units;

  const pending = new Map(checkpoints.map((checkpoint) => [checkpoint.itemId, checkpoint]));
  const rows: FeedRow[] = [];

  for (const unit of units) {
    const ids = unit.kind === "article" ? [unit.item.id] : unit.items.map((item) => item.id);
    const hits = ids.filter((id) => pending.has(id));
    const firstHit = hits[0] ? pending.get(hits[0]) : undefined;
    if (firstHit) {
      rows.push({
        kind: "marker",
        itemId: firstHit.itemId,
        publishedAt: firstHit.publishedAt,
      });
    }
    for (const id of hits) pending.delete(id);
    rows.push(unit);
  }

  return rows;
}
