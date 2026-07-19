/**
 * AI Engine error model.
 * Failures must never bubble as fatal to news publishing.
 */

export type AIErrorCode =
  | "disabled"
  | "capability_unavailable"
  | "provider_unconfigured"
  | "provider_failure"
  | "timeout"
  | "invalid_input"
  | "unknown";

export type AIError = {
  code: AIErrorCode;
  message: string;
  /** Provider id when relevant — opaque to features beyond logging. */
  providerId?: string;
  retryable?: boolean;
  cause?: unknown;
};

/**
 * Result envelope: success or soft-failure.
 * Callers must treat `ok: false` as "skip enrichment", never as crash.
 */
export type AIResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: AIError };
