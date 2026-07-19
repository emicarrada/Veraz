import type { ContentFormat } from "@/domain/shared/enums";
import type { ReferenceKind } from "@/domain/shared/enums";

import type { IngestionInstant, IngestionUrl } from "@/lib/news-ingestion/types/primitives";
import type { NewsProviderId } from "@/lib/news-ingestion/types/provider-id";

/**
 * Candidate discovered by a provider before fetch.
 */
export type IngestionCandidate = {
  providerId: NewsProviderId;
  providerItemId: string;
  sourceSlug: string;
  discoveredUrl: IngestionUrl;
  discoveredAt: IngestionInstant;
  hintTitle?: string;
  hintPublishedAt?: IngestionInstant;
};

export type IngestionCandidateId = string;

export type DiscoverInput = {
  providerId: NewsProviderId;
  sourceSlug: string;
  /** Optional feed/API endpoint reference — resolved from Source config in application layer. */
  endpoint?: string;
  since?: IngestionInstant;
  limit?: number;
};

export type DiscoverOutput = {
  candidates: ReadonlyArray<IngestionCandidate>;
  cursor?: string;
};

export type FetchInput = {
  candidate: IngestionCandidate;
};

export type FetchOutput = {
  payload: ProviderPayload;
};

/**
 * Opaque vendor payload. Only provider adapters and normalizer may interpret contents.
 */
export type ProviderPayload = {
  providerId: NewsProviderId;
  providerItemId: string;
  sourceSlug: string;
  fetchedAt: IngestionInstant;
  /** Raw body or structured vendor document — never leaves ingestion boundary. */
  raw: unknown;
  contentType?: string;
};

export type ReferenceDraft = {
  url: IngestionUrl;
  title?: string;
  publisherName?: string;
  kind: ReferenceKind;
};

/**
 * Internal normalized article — single canonical shape before domain mapping.
 */
export type NormalizedArticle = {
  providerId: NewsProviderId;
  providerItemId: string;
  sourceSlug: string;
  canonicalUrl: IngestionUrl;
  urlFingerprint: string;
  title: string;
  excerpt: string;
  bodyExcerpt?: string;
  publishedAt: IngestionInstant;
  languageCode: string;
  countryCode?: string;
  contentFormat: ContentFormat;
  byline?: string;
  paywallOriginal: boolean;
  heroImageUrl?: IngestionUrl;
  references?: ReadonlyArray<ReferenceDraft>;
  categories?: ReadonlyArray<string>;
  tags?: ReadonlyArray<string>;
  /** Debug/observability only — must not leak outside the Engine. */
  rawMetadata?: Record<string, unknown>;
};
