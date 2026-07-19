import {
  IngestionEngineError,
  type IngestionErrorPayload,
} from "@/lib/news-ingestion/errors/base";
import type { IngestionErrorCode } from "@/lib/news-ingestion/errors/codes";
import type { NewsProviderId } from "@/lib/news-ingestion/types/provider-id";

abstract class ProviderIngestionError extends IngestionEngineError {
  override readonly providerId: NewsProviderId;
  abstract override readonly code: IngestionErrorCode;

  constructor(
    providerId: NewsProviderId,
    message: string,
    options?: { retryable?: boolean; cause?: unknown },
  ) {
    super(message, { providerId, retryable: options?.retryable ?? false, cause: options?.cause });
    this.providerId = providerId;
  }

  toPayload(): IngestionErrorPayload {
    return {
      code: this.code,
      message: this.message,
      providerId: this.providerId,
      retryable: this.retryable,
      cause: this.cause,
    };
  }
}

export class ProviderNotImplementedError extends ProviderIngestionError {
  override readonly code = "provider_not_implemented" as const;

  constructor(providerId: NewsProviderId, method: string) {
    super(
      providerId,
      `Provider "${providerId}" method "${method}" is not implemented.`,
    );
  }
}

export class ProviderUnconfiguredError extends ProviderIngestionError {
  override readonly code = "provider_unconfigured" as const;

  constructor(providerId: NewsProviderId, detail?: string) {
    super(
      providerId,
      detail ?? `Provider "${providerId}" is not configured.`,
    );
  }
}

export class ProviderUnavailableError extends ProviderIngestionError {
  override readonly code = "provider_unavailable" as const;

  constructor(providerId: NewsProviderId, detail?: string) {
    super(
      providerId,
      detail ?? `Provider "${providerId}" is unavailable.`,
      { retryable: true },
    );
  }
}

export class ProviderNotRegisteredError extends IngestionEngineError {
  override readonly code = "provider_not_registered" as const;
  override readonly providerId: NewsProviderId;

  constructor(providerId: NewsProviderId) {
    super(`Provider "${providerId}" is not registered.`, { providerId });
    this.providerId = providerId;
  }

  toPayload(): IngestionErrorPayload {
    return {
      code: this.code,
      message: this.message,
      providerId: this.providerId,
      retryable: false,
    };
  }
}

export class DuplicateProviderRegistrationError extends IngestionEngineError {
  override readonly code = "duplicate_provider_registration" as const;
  override readonly providerId: NewsProviderId;

  constructor(providerId: NewsProviderId) {
    super(`Provider "${providerId}" is already registered.`, { providerId });
    this.providerId = providerId;
  }

  toPayload(): IngestionErrorPayload {
    return {
      code: this.code,
      message: this.message,
      providerId: this.providerId,
      retryable: false,
    };
  }
}

export class ProviderRateLimitedError extends ProviderIngestionError {
  override readonly code = "rate_limited" as const;

  constructor(providerId: NewsProviderId, detail?: string) {
    super(
      providerId,
      detail ?? `Provider "${providerId}" is rate limited.`,
      { retryable: true },
    );
  }
}

export class ProviderTimeoutError extends ProviderIngestionError {
  override readonly code = "timeout" as const;

  constructor(providerId: NewsProviderId, detail?: string) {
    super(
      providerId,
      detail ?? `Provider "${providerId}" timed out.`,
      { retryable: true },
    );
  }
}

export class ProviderParseFailureError extends ProviderIngestionError {
  override readonly code = "parse_failure" as const;

  constructor(providerId: NewsProviderId, detail?: string, cause?: unknown) {
    super(
      providerId,
      detail ?? `Provider "${providerId}" returned unparseable data.`,
      { retryable: false, cause },
    );
  }
}

export class ProviderNotFoundError extends ProviderIngestionError {
  override readonly code = "not_found" as const;

  constructor(providerId: NewsProviderId, detail?: string) {
    super(
      providerId,
      detail ?? `Resource not found for provider "${providerId}".`,
    );
  }
}

export class ProviderPolicyViolationError extends ProviderIngestionError {
  override readonly code = "policy_violation" as const;

  constructor(providerId: NewsProviderId, detail?: string) {
    super(
      providerId,
      detail ?? `Policy violation for provider "${providerId}".`,
    );
  }
}

export class InvalidIngestionInputError extends IngestionEngineError {
  override readonly code = "invalid_input" as const;

  constructor(message: string, cause?: unknown) {
    super(message, { retryable: false, cause });
  }

  toPayload(): IngestionErrorPayload {
    return {
      code: this.code,
      message: this.message,
      retryable: this.retryable,
      cause: this.cause,
    };
  }
}
